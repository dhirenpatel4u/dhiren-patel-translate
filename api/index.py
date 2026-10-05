from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import json
import requests


class handler(BaseHTTPRequestHandler):

    def do_GET(self):
        try:
            # Parse URL query parameters
            parsed_url = urlparse(self.path)
            params = parse_qs(parsed_url.query)

            sl = params.get("sl", [None])[0]
            tl = params.get("tl", [None])[0]
            q = params.get("q", [None])[0]

            # Validate parameters
            if not sl:
                self.send_json({
                    "response": "failed",
                    "sl": sl,
                    "tl": tl,
                    "result": None,
                    "error": "Missing 'sl' parameter"
                })
                return

            if not tl:
                self.send_json({
                    "response": "failed",
                    "sl": sl,
                    "tl": tl,
                    "result": None,
                    "error": "Missing 'tl' parameter"
                })
                return

            if not q:
                self.send_json({
                    "response": "failed",
                    "sl": sl,
                    "tl": tl,
                    "result": None,
                    "error": "Missing 'q' parameter"
                })
                return

            # Limit input length
            if len(q) > 5000:
                self.send_json({
                    "response": "failed",
                    "sl": sl,
                    "tl": tl,
                    "result": None,
                    "error": "Text is too long. Maximum 5000 characters."
                })
                return

            # Google Translate endpoint
            google_url = "https://translate.googleapis.com/translate_a/single"

            google_params = {
                "client": "gtx",
                "sl": sl,
                "tl": tl,
                "dt": "t",
                "q": q
            }

            headers = {
                "User-Agent": "Mozilla/5.0"
            }

            google_response = requests.get(
                google_url,
                params=google_params,
                headers=headers,
                timeout=10
            )

            google_response.raise_for_status()

            data = google_response.json()

            # Extract translated text
            result = ""

            if data and data[0]:
                for item in data[0]:
                    if item and len(item) > 0 and item[0]:
                        result += item[0]

            if not result:
                self.send_json({
                    "response": "failed",
                    "sl": sl,
                    "tl": tl,
                    "result": None,
                    "error": "Translation result is empty"
                })
                return

            # Success
            self.send_json({
                "response": "success",
                "sl": sl,
                "tl": tl,
                "result": result
            })

        except requests.exceptions.Timeout:
            self.send_json({
                "response": "failed",
                "sl": sl if "sl" in locals() else None,
                "tl": tl if "tl" in locals() else None,
                "result": None,
                "error": "Translation request timed out"
            })

        except requests.exceptions.RequestException as e:
            self.send_json({
                "response": "failed",
                "sl": sl if "sl" in locals() else None,
                "tl": tl if "tl" in locals() else None,
                "result": None,
                "error": f"Translation request failed: {str(e)}"
            })

        except Exception as e:
            self.send_json({
                "response": "failed",
                "sl": sl if "sl" in locals() else None,
                "tl": tl if "tl" in locals() else None,
                "result": None,
                "error": str(e)
            })

    def send_json(self, data):
        response = json.dumps(
            data,
            ensure_ascii=False
        ).encode("utf-8")

        self.send_response(200)

        self.send_header(
            "Content-Type",
            "application/json; charset=utf-8"
        )

        # CORS
        self.send_header(
            "Access-Control-Allow-Origin",
            "*"
        )

        self.send_header(
            "Access-Control-Allow-Methods",
            "GET, OPTIONS"
        )

        self.send_header(
            "Access-Control-Allow-Headers",
            "Content-Type"
        )

        self.send_header(
            "Content-Length",
            str(len(response))
        )

        self.end_headers()

        self.wfile.write(response)

    def do_OPTIONS(self):
        self.send_response(204)

        self.send_header(
            "Access-Control-Allow-Origin",
            "*"
        )

        self.send_header(
            "Access-Control-Allow-Methods",
            "GET, OPTIONS"
        )

        self.send_header(
            "Access-Control-Allow-Headers",
            "Content-Type"
        )

        self.end_headers()
