#!/usr/bin/env bash
set -euo pipefail

# --- Configuration ---
REMOTE_USER="i8zy3ffql1rd"
REMOTE_HOST="107.180.114.77"
REMOTE_PATH="/home/i8zy3ffql1rd/public_html/"

# --- Parse flags ---
DRY_RUN=false
for arg in "$@"; do
  case "${arg}" in
    --dry-run)
      DRY_RUN=true
      ;;
    *)
      echo "Unknown argument: ${arg}"
      echo "Usage: $(basename "${BASH_SOURCE[0]}") [--dry-run]"
      exit 1
      ;;
  esac
done

RSYNC_FLAGS=(-avz --progress)
if [[ "${DRY_RUN}" == true ]]; then
  RSYNC_FLAGS+=(--dry-run)
  echo "*** DRY RUN MODE: no files will actually be copied or overwritten ***"
  echo ""
fi

# Resolve the directory this script lives in, so it works regardless of where you call it from
LOCAL_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT_NAME="$(basename "${BASH_SOURCE[0]}")"
BACKUP_DIR="${LOCAL_ROOT}/.backups/$(date +%Y_%m_%d)"

echo "=================================================="
echo " Step 1: Backing up remote site"
echo " Source:      ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}"
echo " Destination: ${BACKUP_DIR}"
echo "=================================================="

mkdir -p "${BACKUP_DIR}"
rsync "${RSYNC_FLAGS[@]}" \
  "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}" \
  "${BACKUP_DIR}/"

echo ""
echo "=================================================="
echo " Step 2: Deploying local site to remote"
echo " Source:      ${LOCAL_ROOT}"
echo " Destination: ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}"
echo "=================================================="

if [[ "${DRY_RUN}" == true ]]; then
  echo "Dry run: skipping confirmation prompt, showing what WOULD be deployed."
else
  read -p "Backup complete. Proceed with deploy? [y/N] " confirm
  if [[ "${confirm}" != "y" && "${confirm}" != "Y" ]]; then
    echo "Deploy cancelled. Backup is safely stored at ${BACKUP_DIR}"
    exit 0
  fi
fi

rsync "${RSYNC_FLAGS[@]}" \
  --exclude '.backups/' \
  --exclude '.git/' \
  --exclude ".DS_Store" \
  --exclude "${SCRIPT_NAME}" \
  "${LOCAL_ROOT}/" \
  "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}"

echo ""
if [[ "${DRY_RUN}" == true ]]; then
  echo "Dry run complete. No files were actually copied, backed up, or deployed."
  echo "(Note: an empty folder was created at ${BACKUP_DIR} by mkdir, but it was NOT populated — re-run without --dry-run to perform the real backup and deploy.)"
else
  echo "Done. Remote backup saved locally at: ${BACKUP_DIR}"
  echo "Local site deployed to remote successfully."
fi


