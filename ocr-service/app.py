from fastapi import FastAPI, File, UploadFile

app = FastAPI(title="CertiChain document scan")


@app.get("/health")
def health():
    return {"status": "UP", "note": "Text field scan is available. Image OCR is not installed yet."}


@app.post("/extract")
async def extract(file: UploadFile = File(...)):
    raw = await file.read()
    text = raw.decode("utf-8", errors="replace")
    if "\x00" in text:
        return {"text": "", "note": "Image OCR is not installed yet. Upload the issued text record."}
    return {"text": text, "note": "Extracted as text. Image OCR is not installed yet."}
