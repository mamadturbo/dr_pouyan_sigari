$ErrorActionPreference = 'Stop'
$taskPnpm = Get-Command pnpm -ErrorAction SilentlyContinue
if ($taskPnpm) {
    & $taskPnpm.Source @args
} else {
    $taskBundledPnpm = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd'
    if (-not (Test-Path -LiteralPath $taskBundledPnpm)) { throw 'Install pnpm 11.25.0, then rerun this command.' }
    & $taskBundledPnpm @args
}
exit $LASTEXITCODE
