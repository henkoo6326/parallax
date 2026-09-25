#!/bin/zsh
cd -- "${0:A:h}"
if ! command -v python3 >/dev/null 2>&1; then
  echo 'Python 3가 필요합니다. 설치 후 다시 실행해 주세요.'
  read '?Enter를 누르면 닫힙니다.'
  exit 1
fi
python3 launch.py
