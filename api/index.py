import requests
from urllib.parse import unquote


def handler(request):
    try:
        # Get query parameters
        sl = request.args.get("sl")
        tl = request.args.get("tl")
        q = request.args.get("q")

        # Validate parameters
        if not sl:
            return {
                "response": "failed",
                "sl": sl,
                "tl": tl,
                "result": None,
                "error": "Missing 'sl' parameter"
            }

        if not tl:
            return {
                "response": "failed",
                "sl": sl,
                "tl": tl,
                "result": None,
                "error": "Missing 'tl' parameter"
            }

        if not q:
            return {
                "response": "failed",
                "sl": sl,
                "tl": tl,
                "result": None,
                "error": "Missing 'q' parameter"
            }

        # Google Translate endpoint
        url = "https://translate.googleapis.com/translate_a/single"

        params = {
            "client": "gtx",
            "sl": sl,
            "tl": tl,
            "dt": "t",
            "q": q
        }

        headers = {
            "User-Agent": "Mozilla/5.0"
        }

        response = requests.get(
            url,
            params=params,
            headers=headers,
            timeout=10
        )

        response.raise_for_status()

        data = response.json()

        # Extract translated text
        result = "".join(
            item[0]
            for item in data[0]
            if item and item[0]
        )

        if not result:
            return {
                "response": "failed",
                "sl": sl,
                "tl": tl,
                "result": None,
                "error": "Translation result is empty"
            }

        return {
            "response": "success",
            "sl": sl,
            "tl": tl,
            "result": result
        }

    except requests.exceptions.Timeout:
        return {
            "response": "failed",
            "sl": sl if "sl" in locals() else None,
            "tl": tl if "tl" in locals() else None,
            "result": None,
            "error": "Translation request timed out"
        }

    except requests.exceptions.RequestException as e:
        return {
            "response": "failed",
            "sl": sl if "sl" in locals() else None,
            "tl": tl if "tl" in locals() else None,
            "result": None,
            "error": f"Translation request failed: {str(e)}"
        }

    except Exception as e:
        return {
            "response": "failed",
            "sl": sl if "sl" in locals() else None,
            "tl": tl if "tl" in locals() else None,
            "result": None,
            "error": str(e)
        }
