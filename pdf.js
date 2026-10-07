"use strict";

/* =========================================================
   Dhiren Translate - PDF OCR + Translation
   Supported PDF Translation Languages:
   Hindi, Marathi, Gujarati
   ========================================================= */


/* =========================================================
   SUPPORTED PDF TRANSLATION LANGUAGES
   ========================================================= */

const PDF_SUPPORTED_TRANSLATION_LANGUAGES = {

    hi: {
        name: "Hindi",
        fontFile: "/fonts/NotoSansDevanagari-Regular.ttf",
        fontName: "NotoSansDevanagari"
    },

    mr: {
        name: "Marathi",
        fontFile: "/fonts/NotoSansDevanagari-Regular.ttf",
        fontName: "NotoSansDevanagari"
    },

    gu: {
        name: "Gujarati",
        fontFile: "/fonts/NotoSansGujarati-Regular.ttf",
        fontName: "NotoSansGujarati"
    }

};


/* =========================================================
   FONT CACHE
   ========================================================= */

const pdfFontCache = {};


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const pdfInput =
    document.getElementById("pdfInput");

const pdfOcrStatus =
    document.getElementById("ocrStatus");

const pdfOcrProgressContainer =
    document.getElementById("ocrProgressContainer");

const pdfOcrProgress =
    document.getElementById("ocrProgress");

const pdfErrorMessage =
    document.getElementById("errorMessage");

const pdfTranslationStatus =
    document.getElementById("translationStatus");

const pdfSourceLanguage =
    document.getElementById("sourceLanguage");

const pdfTargetLanguage =
    document.getElementById("targetLanguage");


/* =========================================================
   CONFIGURATION
   ========================================================= */

const PDF_RENDER_SCALE = 2;

const PDF_JPEG_QUALITY = 0.90;

const PDF_WORKER_URL =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";


/* =========================================================
   OCR LANGUAGE MAP
   ========================================================= */

const PDF_OCR_LANGUAGE_MAP = {

    auto: "eng",

    en: "eng",

    hi: "hin",

    gu: "guj",

    mr: "mar",

    bn: "ben",

    ta: "tam",

    te: "tel",

    kn: "kan",

    ml: "mal",

    pa: "pan",

    ur: "urd",

    or: "ori",

    as: "asm",

    ne: "nep",

    ar: "ara",

    fa: "fas",

    fr: "fra",

    de: "deu",

    es: "spa",

    it: "ita",

    pt: "por",

    ru: "rus",

    uk: "ukr",

    pl: "pol",

    nl: "nld",

    tr: "tur",

    vi: "vie",

    id: "ind",

    ms: "msa",

    th: "tha",

    ja: "jpn",

    ko: "kor",

    zh: "chi_sim"

};


/* =========================================================
   STATUS FUNCTIONS
   ========================================================= */

function pdfSetStatus(message) {

    if (pdfOcrStatus) {
        pdfOcrStatus.textContent = message;
    }
}


function pdfSetTranslationStatus(message) {

    if (pdfTranslationStatus) {
        pdfTranslationStatus.textContent = message;
    }
}


function pdfSetProgress(value) {

    if (!pdfOcrProgressContainer ||
        !pdfOcrProgress) {
        return;
    }

    pdfOcrProgressContainer.style.display = "block";

    const safeValue =
        Math.max(
            0,
            Math.min(100, Number(value) || 0)
        );

    pdfOcrProgress.value = safeValue;

    if (pdfOcrProgress.style) {
        pdfOcrProgress.style.width =
            safeValue + "%";
    }
}


function pdfHideProgress() {

    if (pdfOcrProgressContainer) {
        pdfOcrProgressContainer.style.display =
            "none";
    }

    if (pdfOcrProgress) {
        pdfOcrProgress.value = 0;

        if (pdfOcrProgress.style) {
            pdfOcrProgress.style.width = "0%";
        }
    }
}


/* =========================================================
   ERROR FUNCTIONS
   ========================================================= */

function pdfClearError() {

    if (pdfErrorMessage) {

        pdfErrorMessage.textContent = "";

        pdfErrorMessage.style.display = "none";
    }
}


function pdfShowError(message) {

    console.error(message);

    if (pdfErrorMessage) {

        pdfErrorMessage.textContent =
            String(message);

        pdfErrorMessage.style.display =
            "block";
    }
}


/* =========================================================
   LIBRARY CHECK
   ========================================================= */

function pdfCheckLibraries() {

    if (
        typeof window.pdfjsLib === "undefined"
    ) {

        throw new Error(
            "❌ PDF.js library is not loaded."
        );
    }


    if (
        typeof window.Tesseract === "undefined"
    ) {

        throw new Error(
            "❌ Tesseract.js library is not loaded."
        );
    }


    if (
        typeof window.jspdf === "undefined" ||
        typeof window.jspdf.jsPDF === "undefined"
    ) {

        throw new Error(
            "❌ jsPDF is not loaded."
        );
    }
}


/* =========================================================
   GET SOURCE LANGUAGE
   ========================================================= */

function pdfGetSourceLanguage() {

    if (!pdfSourceLanguage) {
        return "auto";
    }

    const value =
        String(
            pdfSourceLanguage.value || "auto"
        )
        .trim()
        .toLowerCase();

    return value || "auto";
}


/* =========================================================
   GET TARGET LANGUAGE
   ========================================================= */

function pdfGetTargetLanguage() {

    if (!pdfTargetLanguage) {
        return "";
    }

    const value =
        String(
            pdfTargetLanguage.value || ""
        )
        .trim()
        .toLowerCase();

    return value;
}


/* =========================================================
   GET SUPPORTED TARGET LANGUAGE
   ========================================================= */

function pdfGetSupportedTranslationLanguage() {

    const raw =
        pdfGetTargetLanguage();

    const languageCode =
        raw
            .split("-")[0]
            .split("_")[0];

    return (
        PDF_SUPPORTED_TRANSLATION_LANGUAGES[
            languageCode
        ] || null
    );
}


/* =========================================================
   LOAD FONT
   ========================================================= */

async function pdfLoadFont(fontFile) {

    if (pdfFontCache[fontFile]) {

        return pdfFontCache[fontFile];
    }


    const response =
        await fetch(fontFile);


    if (!response.ok) {

        throw new Error(
            "Could not load PDF font: " +
            fontFile +
            " HTTP " +
            response.status
        );
    }


    const buffer =
        await response.arrayBuffer();


    const bytes =
        new Uint8Array(buffer);


    let binary = "";

    const chunkSize = 0x8000;


    for (
        let i = 0;
        i < bytes.length;
        i += chunkSize
    ) {

        const chunk =
            bytes.subarray(
                i,
                Math.min(
                    i + chunkSize,
                    bytes.length
                )
            );


        binary +=
            String.fromCharCode(...chunk);
    }


    const base64 =
        btoa(binary);


    pdfFontCache[fontFile] =
        base64;


    return base64;
}


/* =========================================================
   INITIALIZE PDF.JS
   ========================================================= */

function pdfInitializePDFJS() {

    if (
        typeof window.pdfjsLib === "undefined"
    ) {
        return;
    }


    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        PDF_WORKER_URL;
}


/* =========================================================
   GET OCR LANGUAGE
   ========================================================= */

function pdfGetOCRLanguage() {

    const sourceLanguage =
        pdfGetSourceLanguage();


    return (
        PDF_OCR_LANGUAGE_MAP[
            sourceLanguage
        ] ||
        "eng"
    );
}


/* =========================================================
   CREATE OUTPUT PDF
   ========================================================= */

function pdfCreateOutputDocument(
    width,
    height,
    fontInfo,
    fontBase64
) {

    const pdf =
        new window.jspdf.jsPDF({

            orientation:
                width > height
                    ? "landscape"
                    : "portrait",

            unit: "pt",

            format: [
                width,
                height
            ],

            compress: true
        });


    const fontFileName =
        fontInfo.fontFile
            .split("/")
            .pop();


    pdf.addFileToVFS(
        fontFileName,
        fontBase64
    );


    pdf.addFont(
        fontFileName,
        fontInfo.fontName,
        "normal"
    );


    pdf.setFont(
        fontInfo.fontName,
        "normal"
    );


    return pdf;
}


/* =========================================================
   TRANSLATE TEXT
   ========================================================= */

async function pdfTranslateText(
    text,
    sourceLanguage,
    targetLanguage
) {

    const cleanText =
        String(text || "").trim();


    if (!cleanText) {
        return "";
    }


    const url =
        "/api/?sl=" +
        encodeURIComponent(sourceLanguage) +
        "&tl=" +
        encodeURIComponent(targetLanguage) +
        "&q=" +
        encodeURIComponent(cleanText);


    const response =
        await fetch(url);


    if (!response.ok) {

        throw new Error(
            "Translation API error: HTTP " +
            response.status
        );
    }


    const contentType =
        response.headers.get(
            "content-type"
        ) || "";


    let data;


    if (
        contentType.includes(
            "application/json"
        )
    ) {

        data =
            await response.json();

    } else {

        data =
            await response.text();
    }


    return pdfExtractTranslation(data);
}


/* =========================================================
   EXTRACT TRANSLATION FROM API RESPONSE
   ========================================================= */

function pdfExtractTranslation(data) {

    if (
        typeof data === "string"
    ) {

        return data.trim();
    }


    if (!data) {
        return "";
    }


    if (
        typeof data.translation === "string"
    ) {

        return data.translation.trim();
    }


    if (
        typeof data.translatedText === "string"
    ) {

        return data.translatedText.trim();
    }


    if (
        typeof data.translated_text === "string"
    ) {

        return data.translated_text.trim();
    }


    if (
        typeof data.text === "string"
    ) {

        return data.text.trim();
    }


    if (
        Array.isArray(data)
    ) {

        const parts = [];


        for (const item of data) {

            if (
                typeof item === "string"
            ) {

                parts.push(item);

            } else if (
                item &&
                typeof item.text === "string"
            ) {

                parts.push(item.text);
            }
        }


        if (parts.length) {

            return parts.join(" ").trim();
        }
    }


    return "";
}


/* =========================================================
   SAMPLE BACKGROUND COLOR
   ========================================================= */

function pdfSampleBackground(
    canvas,
    x,
    y,
    width,
    height
) {

    try {

        const ctx =
            canvas.getContext("2d");

        if (!ctx) {
            return "#ffffff";
        }


        const sampleX =
            Math.max(
                0,
                Math.min(
                    canvas.width - 1,
                    Math.round(x)
                )
            );


        const sampleY =
            Math.max(
                0,
                Math.min(
                    canvas.height - 1,
                    Math.round(y)
                )
            );


        const sampleWidth =
            Math.max(
                1,
                Math.min(
                    canvas.width - sampleX,
                    Math.round(width)
                )
            );


        const sampleHeight =
            Math.max(
                1,
                Math.min(
                    canvas.height - sampleY,
                    Math.round(height)
                )
            );


        const imageData =
            ctx.getImageData(
                sampleX,
                sampleY,
                sampleWidth,
                sampleHeight
            );


        const data =
            imageData.data;


        let r = 0;
        let g = 0;
        let b = 0;
        let count = 0;


        for (
            let i = 0;
            i < data.length;
            i += 4
        ) {

            r += data[i];

            g += data[i + 1];

            b += data[i + 2];

            count++;
        }


        if (!count) {
            return "#ffffff";
        }


        r =
            Math.round(r / count);

        g =
            Math.round(g / count);

        b =
            Math.round(b / count);


        return (
            "#" +
            r.toString(16).padStart(2, "0") +
            g.toString(16).padStart(2, "0") +
            b.toString(16).padStart(2, "0")
        );

    } catch (error) {

        console.warn(
            "Background sampling failed:",
            error
        );

        return "#ffffff";
    }
}


/* =========================================================
   DRAW TRANSLATED TEXT
   ========================================================= */

function pdfDrawTranslatedText(
    pdf,
    canvas,
    line,
    translatedText,
    fontInfo
) {

    if (
        !translatedText ||
        !translatedText.trim()
    ) {

        return;
    }


    if (!line || !line.bbox) {

        return;
    }


    const bbox =
        line.bbox;


    const x =
        Number(bbox.x0 || 0) /
        PDF_RENDER_SCALE;


    const y =
        Number(bbox.y0 || 0) /
        PDF_RENDER_SCALE;


    const width =
        Math.max(
            5,
            (
                Number(bbox.x1 || 0) -
                Number(bbox.x0 || 0)
            ) /
            PDF_RENDER_SCALE
        );


    const height =
        Math.max(
            5,
            (
                Number(bbox.y1 || 0) -
                Number(bbox.y0 || 0)
            ) /
            PDF_RENDER_SCALE
        );


    /* -----------------------------------------------------
       Cover original text
       ----------------------------------------------------- */

    const bgColor =
        pdfSampleBackground(
            canvas,
            Number(bbox.x0 || 0),
            Number(bbox.y0 || 0),
            Math.max(
                1,
                Number(bbox.x1 || 0) -
                Number(bbox.x0 || 0)
            ),
            Math.max(
                1,
                Number(bbox.y1 || 0) -
                Number(bbox.y0 || 0)
            )
        );


    pdf.setFillColor(bgColor);

    pdf.rect(
        x - 1,
        y - 1,
        width + 2,
        height + 2,
        "F"
    );


    /* -----------------------------------------------------
       Select Unicode font
       ----------------------------------------------------- */

    pdf.setFont(
        fontInfo.fontName,
        "normal"
    );


    /* -----------------------------------------------------
       Calculate font size
       ----------------------------------------------------- */

    const originalText =
        String(
            line.text || ""
        ).trim();


    const originalLength =
        Math.max(
            1,
            originalText.length
        );


    const translatedLength =
        Math.max(
            1,
            translatedText.length
        );


    let fontSize =
        height * 0.80;


    const ratio =
        originalLength /
        translatedLength;


    if (ratio < 0.45) {

        fontSize *= 0.70;

    } else if (ratio < 0.65) {

        fontSize *= 0.78;

    } else if (ratio < 0.85) {

        fontSize *= 0.88;
    }


    fontSize =
        Math.max(
            6,
            Math.min(
                24,
                fontSize
            )
        );


    pdf.setFontSize(
        fontSize
    );


    pdf.setTextColor(
        0,
        0,
        0
    );


    /* -----------------------------------------------------
       Wrap translated text
       ----------------------------------------------------- */

    let wrappedText;


    try {

        wrappedText =
            pdf.splitTextToSize(
                translatedText,
                Math.max(
                    10,
                    width
                )
            );

    } catch (error) {

        console.warn(
            "Text wrapping failed:",
            error
        );

        wrappedText =
            [translatedText];
    }


    if (!Array.isArray(wrappedText)) {

        wrappedText =
            [wrappedText];
    }


    /* -----------------------------------------------------
       Draw text
       ----------------------------------------------------- */

    const lineHeight =
        fontSize * 1.15;


    let drawY =
        y +
        fontSize * 0.82;


    const maxLines =
        Math.max(
            1,
            Math.floor(
                (height + fontSize * 0.25) /
                lineHeight
            )
        );


    const visibleLines =
        wrappedText.slice(
            0,
            maxLines
        );


    for (
        const textLine of visibleLines
    ) {

        if (
            textLine &&
            String(textLine).trim()
        ) {

            pdf.text(
                String(textLine),
                x,
                drawY,
                {
                    baseline: "alphabetic"
                }
            );
        }


        drawY += lineHeight;
    }
}


/* =========================================================
   PROCESS PDF
   ========================================================= */

async function pdfProcessFile(file) {

    pdfClearError();

    pdfHideProgress();


    try {

        /* -------------------------------------------------
           CHECK LIBRARIES
           ------------------------------------------------- */

        pdfCheckLibraries();


        /* -------------------------------------------------
           CHECK FILE
           ------------------------------------------------- */

        if (!file) {

            return;
        }


        if (
            file.type !== "application/pdf" &&
            !file.name
                .toLowerCase()
                .endsWith(".pdf")
        ) {

            throw new Error(
                "Please select a PDF file."
            );
        }


        /* -------------------------------------------------
           CHECK TARGET LANGUAGE
           ------------------------------------------------- */

        const fontInfo =
            pdfGetSupportedTranslationLanguage();


        if (!fontInfo) {

            const message =
                "Translation not available for this language. Please try Hindi, Gujarati or Marathi.";


            pdfShowError(message);

            pdfSetTranslationStatus(
                message
            );

            return;
        }


        /* -------------------------------------------------
           GET LANGUAGES
           ------------------------------------------------- */

        const sourceLanguage =
            pdfGetSourceLanguage();


        const targetLanguage =
            pdfGetTargetLanguage();


        const ocrLanguage =
            pdfGetOCRLanguage();


        console.log(
            "PDF Source Language:",
            sourceLanguage
        );


        console.log(
            "PDF Target Language:",
            targetLanguage
        );


        console.log(
            "PDF OCR Language:",
            ocrLanguage
        );


        console.log(
            "PDF Font:",
            fontInfo.fontName
        );


        /* -------------------------------------------------
           LOAD FONT
           ------------------------------------------------- */

        pdfSetStatus(
            `🔤 Loading ${fontInfo.name} PDF font...`
        );


        pdfSetTranslationStatus(
            `Loading ${fontInfo.name} PDF font...`
        );


        const fontBase64 =
            await pdfLoadFont(
                fontInfo.fontFile
            );


        console.log(
            "PDF font loaded successfully."
        );


        /* -------------------------------------------------
           LOAD PDF
           ------------------------------------------------- */

        pdfSetStatus(
            "📄 Loading PDF..."
        );


        const arrayBuffer =
            await file.arrayBuffer();


        const pdfDocument =
            await window.pdfjsLib
                .getDocument({
                    data: arrayBuffer
                })
                .promise;


        const totalPages =
            pdfDocument.numPages;


        console.log(
            "PDF pages:",
            totalPages
        );


        /* -------------------------------------------------
           GET FIRST PAGE SIZE
           ------------------------------------------------- */

        const firstPage =
            await pdfDocument.getPage(1);


        const firstViewport =
            firstPage.getViewport({
                scale: 1
            });


        const pageWidth =
            firstViewport.width;


        const pageHeight =
            firstViewport.height;


        /* -------------------------------------------------
           CREATE OUTPUT PDF
           ------------------------------------------------- */

        pdfSetStatus(
            "📑 Creating output PDF..."
        );


        const outputPdf =
            pdfCreateOutputDocument(
                pageWidth,
                pageHeight,
                fontInfo,
                fontBase64
            );


        /* -------------------------------------------------
           CREATE TESSERACT WORKER
           ------------------------------------------------- */

        pdfSetStatus(
            `🔎 Loading OCR language (${ocrLanguage})...`
        );


        const worker =
            await window.Tesseract.createWorker(
                ocrLanguage,
                1,
                {
                    logger: message => {

                        console.log(
                            "Tesseract:",
                            message
                        );
                    }
                }
            );


        /* -------------------------------------------------
           PROCESS EACH PAGE
           ------------------------------------------------- */

        for (
            let pageNumber = 1;
            pageNumber <= totalPages;
            pageNumber++
        ) {

            console.log(
                `Processing page ${pageNumber}/${totalPages}`
            );


            pdfSetStatus(
                `📄 Processing page ${pageNumber} of ${totalPages}...`
            );


            pdfSetProgress(
                (
                    (pageNumber - 1) /
                    totalPages
                ) *
                100
            );


            /* ---------------------------------------------
               GET PAGE
               --------------------------------------------- */

            const page =
                pageNumber === 1
                    ? firstPage
                    : await pdfDocument.getPage(
                        pageNumber
                    );


            const viewport =
                page.getViewport({
                    scale: PDF_RENDER_SCALE
                });


            const pdfViewport =
                page.getViewport({
                    scale: 1
                });


            const currentPageWidth =
                pdfViewport.width;


            const currentPageHeight =
                pdfViewport.height;


            /* ---------------------------------------------
               ADD PAGE TO OUTPUT
               --------------------------------------------- */

            if (pageNumber > 1) {

                outputPdf.addPage(
                    [
                        currentPageWidth,
                        currentPageHeight
                    ],
                    currentPageWidth >
                    currentPageHeight
                        ? "landscape"
                        : "portrait"
                );
            }


            /* ---------------------------------------------
               CREATE CANVAS
               --------------------------------------------- */

            const canvas =
                document.createElement(
                    "canvas"
                );


            const context =
                canvas.getContext(
                    "2d",
                    {
                        willReadFrequently: true
                    }
                );


            canvas.width =
                Math.ceil(
                    viewport.width
                );


            canvas.height =
                Math.ceil(
                    viewport.height
                );


            /* ---------------------------------------------
               RENDER PDF PAGE
               --------------------------------------------- */

            await page.render({

                canvasContext: context,

                viewport: viewport

            }).promise;


            /* ---------------------------------------------
               ADD ORIGINAL PAGE IMAGE
               --------------------------------------------- */

            const pageImage =
                canvas.toDataURL(
                    "image/jpeg",
                    PDF_JPEG_QUALITY
                );


            outputPdf.addImage(

                pageImage,

                "JPEG",

                0,

                0,

                currentPageWidth,

                currentPageHeight,

                undefined,

                "FAST"
            );


            /* ---------------------------------------------
               OCR PAGE
               --------------------------------------------- */

            pdfSetStatus(
                `🔎 OCR page ${pageNumber} of ${totalPages}...`
            );


            const ocrResult =
                await worker.recognize(
                    canvas
                );


            const ocrData =
                ocrResult &&
                ocrResult.data
                    ? ocrResult.data
                    : null;


            const lines =
                ocrData &&
                Array.isArray(
                    ocrData.lines
                )
                    ? ocrData.lines
                    : [];


            console.log(
                `OCR lines on page ${pageNumber}:`,
                lines.length
            );


            /* ---------------------------------------------
               TRANSLATE LINES
               --------------------------------------------- */

            for (
                let i = 0;
                i < lines.length;
                i++
            ) {

                const line =
                    lines[i];


                const originalText =
                    String(
                        line.text || ""
                    ).trim();


                if (!originalText) {
                    continue;
                }


                try {

                    pdfSetTranslationStatus(
                        `🌐 Translating page ${pageNumber}: ${i + 1}/${lines.length}`
                    );


                    const translatedText =
                        await pdfTranslateText(
                            originalText,
                            sourceLanguage,
                            targetLanguage
                        );


                    if (
                        translatedText &&
                        translatedText.trim()
                    ) {

                        pdfDrawTranslatedText(

                            outputPdf,

                            canvas,

                            line,

                            translatedText,

                            fontInfo
                        );
                    }


                } catch (translationError) {

                    console.warn(
                        "Translation failed for line:",
                        originalText,
                        translationError
                    );

                    /*
                     * If one line fails, continue
                     * with the remaining PDF.
                     */
                }


                const pageTranslationProgress =
                    (
                        (i + 1) /
                        Math.max(
                            1,
                            lines.length
                        )
                    ) *
                    100;


                const overallProgress =
                    (
                        (
                            pageNumber - 1
                        ) /
                        totalPages
                    ) *
                    100
                    +
                    (
                        pageTranslationProgress /
                        totalPages
                    );


                pdfSetProgress(
                    overallProgress
                );
            }
        }


        /* -------------------------------------------------
           TERMINATE OCR WORKER
           ------------------------------------------------- */

        try {

            await worker.terminate();

        } catch (terminateError) {

            console.warn(
                "Tesseract worker termination error:",
                terminateError
            );
        }


        /* -------------------------------------------------
           PDF METADATA
           ------------------------------------------------- */

        outputPdf.setProperties({

            title:
                "Dhiren Translate - Translated PDF",

            subject:
                `Translated to ${fontInfo.name}`,

            author:
                "Dhiren Translate",

            creator:
                "Dhiren Translate"
        });


        /* -------------------------------------------------
           SAVE PDF
           ------------------------------------------------- */

        const originalName =
            file.name
                .replace(
                    /\.pdf$/i,
                    ""
                )
                .replace(
                    /[^a-zA-Z0-9_-]+/g,
                    "_"
                );


        const outputFileName =
            "translated_" +
            originalName +
            ".pdf";


        pdfSetStatus(
            "💾 Saving translated PDF..."
        );


        pdfSetTranslationStatus(
            "✅ Translation completed."
        );


        pdfSetProgress(100);


        outputPdf.save(
            outputFileName
        );


        pdfSetStatus(
            "✅ PDF translation completed."
        );


        setTimeout(() => {

            pdfHideProgress();

        }, 1500);


        console.log(
            "PDF saved:",
            outputFileName
        );


    } catch (error) {

        console.error(
            "PDF processing error:",
            error
        );


        pdfShowError(
            error &&
            error.message
                ? error.message
                : String(error)
        );


        pdfSetStatus(
            "❌ PDF processing failed."
        );


        pdfSetTranslationStatus(
            "❌ Translation failed."
        );


        pdfHideProgress();
    }
}


/* =========================================================
   FILE INPUT EVENT
   ========================================================= */

if (pdfInput) {

    pdfInput.addEventListener(
        "change",
        event => {

            const file =
                event.target.files &&
                event.target.files[0];


            if (!file) {
                return;
            }


            pdfProcessFile(file);
        }
    );
}


/* =========================================================
   INITIALIZE
   ========================================================= */

pdfInitializePDFJS();


/* =========================================================
   DIAGNOSTICS
   ========================================================= */

console.log(
    "Dhiren Translate PDF module loaded."
);


console.log(
    "Tesseract:",
    typeof window.Tesseract
);


console.log(
    "PDF.js:",
    typeof window.pdfjsLib
);


console.log(
    "jsPDF:",
    typeof window.jspdf
);


console.log(
    "jsPDF class:",
    typeof window.jspdf?.jsPDF
);
