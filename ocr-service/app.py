import io

from fastapi import FastAPI, File, UploadFile
from PIL import Image

app = FastAPI(title="CertiChain document scan")


@app.get("/health")
def health():
    return {"status": "UP", "note": "Image OCR is available."}


@app.post("/extract")
async def extract(file: UploadFile = File(...)):
    raw = await file.read()
    try:
        import pytesseract

        image = Image.open(io.BytesIO(raw))
        text = pytesseract.image_to_string(image)
    except Exception as error:
        return {"text": "", "note": f"Image OCR could not read that file. {error}"}
    if not text.strip():
        return {"text": "", "note": "Image OCR did not find any text."}
    return {"text": text, "note": "Text was read from the image."}
