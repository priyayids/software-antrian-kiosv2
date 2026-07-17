<#
  raw-print.ps1
  Sends a file of raw bytes (ESC/POS commands) directly to a Windows printer
  using the WinSpool "RAW" data type.

  Why this exists:
  Printing through the normal Windows print pipeline (e.g. `Out-Printer` or a
  browser's print dialog) renders the ticket as a GDI "page" using whatever
  page size/orientation the printer driver currently has configured. Many
  thermal receipt printer drivers default that page to landscape, which is
  why tickets can come out rotated 90 degrees. RAW mode skips that rendering
  step entirely: the bytes go straight to the printer's own firmware, which
  just prints them top to bottom as sent - no page, no orientation, no
  rotation.

  Usage:
    powershell -NoProfile -ExecutionPolicy Bypass -File raw-print.ps1 `
      -PrinterName "POS-58" -DataFile "C:\path\ticket.bin"

  If -PrinterName is omitted, the current Windows default printer is used.
#>
param(
  [string]$PrinterName,
  [Parameter(Mandatory = $true)][string]$DataFile
)

Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;

public class RawPrinterHelper {
    [StructLayout(LayoutKind.Sequential)]
    public struct DOCINFOA {
        [MarshalAs(UnmanagedType.LPStr)] public string pDocName;
        [MarshalAs(UnmanagedType.LPStr)] public string pOutputFile;
        [MarshalAs(UnmanagedType.LPStr)] public string pDataType;
    }

    [DllImport("winspool.drv", EntryPoint = "OpenPrinterA", SetLastError = true, CharSet = CharSet.Ansi)]
    public static extern bool OpenPrinter(string szPrinter, out IntPtr hPrinter, IntPtr pd);

    [DllImport("winspool.drv", EntryPoint = "ClosePrinter", SetLastError = true)]
    public static extern bool ClosePrinter(IntPtr hPrinter);

    [DllImport("winspool.drv", EntryPoint = "StartDocPrinterA", SetLastError = true, CharSet = CharSet.Ansi)]
    public static extern bool StartDocPrinter(IntPtr hPrinter, int level, ref DOCINFOA di);

    [DllImport("winspool.drv", EntryPoint = "EndDocPrinter", SetLastError = true)]
    public static extern bool EndDocPrinter(IntPtr hPrinter);

    [DllImport("winspool.drv", EntryPoint = "StartPagePrinter", SetLastError = true)]
    public static extern bool StartPagePrinter(IntPtr hPrinter);

    [DllImport("winspool.drv", EntryPoint = "EndPagePrinter", SetLastError = true)]
    public static extern bool EndPagePrinter(IntPtr hPrinter);

    [DllImport("winspool.drv", EntryPoint = "WritePrinter", SetLastError = true)]
    public static extern bool WritePrinter(IntPtr hPrinter, byte[] pBytes, int dwCount, out int dwWritten);

    public static bool SendBytesToPrinter(string printerName, byte[] bytes, out string error) {
        IntPtr hPrinter;
        error = "";
        DOCINFOA di = new DOCINFOA();
        di.pDocName = "Tiket Antrian";
        di.pDataType = "RAW";
        int written;

        if (!OpenPrinter(printerName, out hPrinter, IntPtr.Zero)) {
            error = "OpenPrinter failed (err " + Marshal.GetLastWin32Error() + ")";
            return false;
        }
        try {
            if (!StartDocPrinter(hPrinter, 1, ref di)) {
                error = "StartDocPrinter failed (err " + Marshal.GetLastWin32Error() + ")";
                return false;
            }
            try {
                if (!StartPagePrinter(hPrinter)) {
                    error = "StartPagePrinter failed (err " + Marshal.GetLastWin32Error() + ")";
                    return false;
                }
                try {
                    if (!WritePrinter(hPrinter, bytes, bytes.Length, out written) || written != bytes.Length) {
                        error = "WritePrinter failed (err " + Marshal.GetLastWin32Error() + ")";
                        return false;
                    }
                    return true;
                } finally { EndPagePrinter(hPrinter); }
            } finally { EndDocPrinter(hPrinter); }
        } finally { ClosePrinter(hPrinter); }
    }
}
"@

if ([string]::IsNullOrWhiteSpace($PrinterName)) {
    $PrinterName = (Get-CimInstance -ClassName Win32_Printer -ErrorAction SilentlyContinue |
        Where-Object { $_.Default -eq $true } |
        Select-Object -First 1 -ExpandProperty Name)
}

if ([string]::IsNullOrWhiteSpace($PrinterName)) {
    Write-Error "No printer name given and no default Windows printer was found."
    exit 1
}

if (-not (Test-Path -LiteralPath $DataFile)) {
    Write-Error "Data file not found: $DataFile"
    exit 1
}

$bytes = [System.IO.File]::ReadAllBytes($DataFile)
$err = ""
$ok = [RawPrinterHelper]::SendBytesToPrinter($PrinterName, $bytes, [ref]$err)

if (-not $ok) {
    Write-Error "Failed to print to '$PrinterName': $err"
    exit 1
}

Write-Output "OK"
