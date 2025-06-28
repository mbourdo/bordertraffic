import requests
from bs4 import BeautifulSoup
import json
import os

URL = "https://www.niagarafallsbridges.com/services/traffic-conditions"
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/114.0 Safari/537.36"
    )
}

def get_wait_times():
    res = requests.get(URL, headers=HEADERS)
    res.raise_for_status()
    soup = BeautifulSoup(res.text, "html.parser")

    timestamp = "Unknown time"
    timestamp_tag = soup.find("p", class_="timestamp")
    if timestamp_tag:
        timestamp = timestamp_tag.get_text(strip=True)

    tables = soup.find_all("table")
    if len(tables) < 2:
        raise ValueError("Expected at least two tables for USA and Canada")

    def parse_table(table):
        rows = table.find_all("tr")
        header = [th.get_text(strip=True).lower() for th in rows[0].find_all("th")]
        parsed = {}

        for row in rows[1:]:
            cells = row.find_all(["td", "th"])
            if len(cells) != len(header):
                continue
            bridge = cells[0].get_text(strip=True)
            parsed[bridge] = {}
            for i in range(1, len(cells)):
                vehicle_type = header[i]
                wait_time = cells[i].get_text(strip=True)
                parsed[bridge][vehicle_type] = wait_time

        return parsed

    to_usa = parse_table(tables[0])
    to_canada = parse_table(tables[1])

    return {
        "timestamp": timestamp,
        "to_usa": to_usa,
        "to_canada": to_canada
    }

def save_json(data):
    output_path = os.path.join(os.path.dirname(__file__), "..", "public", "waitTimes.json")
    with open(output_path, "w") as f:
        json.dump(data, f, indent=2)
    print("✅ waitTimes.json saved to public/")

if __name__ == "__main__":
    try:
        data = get_wait_times()
        save_json(data)
    except Exception as e:
        print("❌ Failed to fetch or save wait times:", str(e))