"use strict";

/*
===========================================================
 Dhiren Translate - PDF OCR + Translation
 ----------------------------------------------------------
 IMPORTANT:
 - Do NOT modify app.js.
 - This file works independently.
 - Requires:
      Tesseract.js
      PDF.js
      jsPDF
===========================================================
*/


/* =========================================================
   CONFIGURATION
   ========================================================= */

const PDFJS_VERSION = "3.11.174";

const PDFJS_WORKER_URL =
    `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`;

const MAX_TRANSLATION_CHARS = 2500;

const PDF_RENDER_SCALE = 2.0;

const JPEG_QUALITY = 0.88;


/* =========================================================
   PDF.JS INITIALIZATION
   ========================================================= */

if (typeof pdfjsLib !== "undefined") {

    pdfjsLib.GlobalWorkerOptions.workerSrc =
        PDFJS_WORKER_URL;

    console.log(
        "PDF.js loaded:",
        pdfjsLib.version
    );

} else {

    console.error(
        "PDF.js library is not loaded."
    );
}


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const pdfInput =
    document.getElementById("pdfInput");

const sourceLanguage =
    document.getElementById("sourceLanguage");

const targetLanguage =
    document.getElementById("targetLanguage");

const sourceText =
    document.getElementById("sourceText");

const translationResult =
    document.getElementById("translationResult");

const translationStatus =
    document.getElementById("translationStatus");

const ocrStatus =
    document.getElementById("ocrStatus");

const ocrProgressContainer =
    document.getElementById("ocrProgressContainer");

const ocrProgress =
    document.getElementById("ocrProgress");

const translateButton =
    document.getElementById("translateButton");

const translateButtonText =
    document.getElementById("translateButtonText");

const translateSpinner =
    document.getElementById("translateSpinner");

const errorMessage =
    document.getElementById("errorMessage");


/* =========================================================
   SAFETY CHECK
   ========================================================= */

if (!pdfInput) {

    console.error(
        "pdfInput element was not found."
    );

}


/* =========================================================
   LANGUAGE MAP
   =========================================================

   Tesseract language names are different from some
   language codes used by translation APIs.

========================================================= */

const PDF_OCR_LANGUAGES = {

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
   UTILITY FUNCTIONS
   ========================================================= */

function sleep(ms) {

    return new Promise(resolve =>
        setTimeout(resolve, ms)
    );

}


/* ---------------------------------------------------------
   Show status
--------------------------------------------------------- */

function setPDFStatus(message) {

    if (ocrStatus) {

        ocrStatus.textContent =
            message;

        ocrStatus.classList.remove(
            "hidden"
        );

    }

    console.log(
        "[PDF]",
        message
    );

}


/* ---------------------------------------------------------
   Hide status
--------------------------------------------------------- */

function hidePDFStatus() {

    if (ocrStatus) {

        ocrStatus.classList.add(
            "hidden"
        );

        ocrStatus.textContent =
            "";

    }

}


/* ---------------------------------------------------------
   Progress
--------------------------------------------------------- */

function setPDFProgress(percent) {

    percent =
        Math.max(
            0,
            Math.min(
                100,
                percent
            )
        );

    if (ocrProgressContainer) {

        ocrProgressContainer.classList.remove(
            "hidden"
        );

    }

    if (ocrProgress) {

        ocrProgress.style.width =
            `${percent}%`;

    }

}


/* ---------------------------------------------------------
   Hide progress
--------------------------------------------------------- */

function hidePDFProgress() {

    if (ocrProgressContainer) {

        ocrProgressContainer.classList.add(
            "hidden"
        );

    }

    if (ocrProgress) {

        ocrProgress.style.width =
            "0%";

    }

}


/* ---------------------------------------------------------
   Error
--------------------------------------------------------- */

function showPDFError(message) {

    console.error(
        "[PDF ERROR]",
        message
    );

    if (errorMessage) {

        errorMessage.textContent =
            message;

        errorMessage.classList.remove(
            "hidden"
        );

    }

    setPDFStatus(
        "❌ " + message
    );

}


/* ---------------------------------------------------------
   Clear error
--------------------------------------------------------- */

function clearPDFError() {

    if (errorMessage) {

        errorMessage.textContent =
            "";

        errorMessage.classList.add(
            "hidden"
        );

    }

}


/* =========================================================
   CHECK REQUIRED LIBRARIES
   ========================================================= */

function checkPDFLibraries() {

    if (
        typeof pdfjsLib ===
        "undefined"
    ) {

        throw new Error(
            "PDF.js could not be loaded."
        );

    }


    if (
        typeof window.jspdf ===
        "undefined"
    ) {

        throw new Error(
            "jsPDF could not be loaded. Please check the jsPDF CDN."
        );

    }


    if (
        typeof window.jspdf.jsPDF !==
        "function"
    ) {

        throw new Error(
            "jsPDF is loaded incorrectly."
        );

    }


    if (
        typeof Tesseract ===
        "undefined"
    ) {

        throw new Error(
            "Tesseract.js could not be loaded."
        );

    }


    console.log(
        "All PDF libraries are ready."
    );

}


/* =========================================================
   GET OCR LANGUAGE
   ========================================================= */

function getOCRLanguage() {

    let language =
        sourceLanguage
            ? sourceLanguage.value
            : "auto";


    /*
       Some select elements may contain values such as:

       en-US
       en
       English

       Extract the first language part.
    */

    language =
        String(language)
            .toLowerCase()
            .split("-")[0]
            .split("_")[0];


    return (
        PDF_OCR_LANGUAGES[language] ||
        "eng"
    );

}


/* =========================================================
   GET TRANSLATION LANGUAGES
   ========================================================= */

function getTranslationLanguages() {

    const sl =
        sourceLanguage
            ? sourceLanguage.value
            : "auto";

    const tl =
        targetLanguage
            ? targetLanguage.value
            : "en";


    return {
        sl,
        tl
    };

}


/* =========================================================
   RENDER PDF PAGE
   ========================================================= */

async function renderPDFPage(
    page
) {

    const viewport =
        page.getViewport({
            scale: PDF_RENDER_SCALE
        });


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


    await page.render({

        canvasContext:
            context,

        viewport:
            viewport

    }).promise;


    return {

        canvas,

        context,

        viewport

    };

}


/* =========================================================
   OCR PDF PAGE
   ========================================================= */

async function OCRPDFPage(
    canvas,
    pageNumber,
    totalPages
) {

    const ocrLanguage =
        getOCRLanguage();


    setPDFStatus(
        `🔍 OCR page ${pageNumber} of ${totalPages}...`
    );


    /*
       If source language is Auto, English is used
       as the Tesseract base language.

       This avoids loading many large language files.
    */

    let language =
        ocrLanguage;


    /*
       Tesseract worker
    */

    const worker =
        await Tesseract.createWorker(
            language,
            1,
            {
                logger: function(info) {

                    if (
                        info.status ===
                        "recognizing text"
                    ) {

                        const local =
                            info.progress || 0;

                        console.log(
                            `OCR ${pageNumber}:`,
                            Math.round(
                                local * 100
                            ) + "%"
                        );

                    }

                }
            }
        );


    try {

        const result =
            await worker.recognize(
                canvas
            );


        return result.data;

    } finally {

        await worker.terminate();

    }

}


/* =========================================================
   NORMALIZE OCR TEXT
   ========================================================= */

function normalizeOCRText(
    text
) {

    if (!text) {

        return "";

    }


    return String(text)

        .replace(
            /\r\n/g,
            "\n"
        )

        .replace(
            /\r/g,
            "\n"
        )

        .replace(
            /[ \t]+/g,
            " "
        )

        .replace(
            /\n{3,}/g,
            "\n\n"
        )

        .trim();

}


/* =========================================================
   CLEAN OCR LINE
   ========================================================= */

function cleanOCRLine(
    text
) {

    if (!text) {

        return "";

    }


    return String(text)

        .replace(
            /\s+/g,
            " "
        )

        .trim();

}


/* =========================================================
   TRANSLATION API
   ========================================================= */

async function translateText(
    text,
    sl,
    tl
) {

    text =
        cleanOCRLine(text);


    if (!text) {

        return "";

    }


    /*
       Don't translate if source and target
       are the same.
    */

    if (
        sl &&
        tl &&
        String(sl).toLowerCase() ===
        String(tl).toLowerCase()
    ) {

        return text;

    }


    /*
       Split very large OCR blocks.
    */

    const chunks =
        splitTextForTranslation(
            text,
            MAX_TRANSLATION_CHARS
        );


    const translatedChunks =
        [];


    for (
        let i = 0;
        i < chunks.length;
        i++
    ) {

        const chunk =
            chunks[i];


        const url =
            `/api/?sl=${encodeURIComponent(sl)}&tl=${encodeURIComponent(tl)}&q=${encodeURIComponent(chunk)}`;


        const response =
            await fetch(
                url,
                {
                    method: "GET",
                    headers: {
                        "Accept":
                            "application/json,text/plain,*/*"
                    }
                }
            );


        if (!response.ok) {

            throw new Error(
                `Translation API error: HTTP ${response.status}`
            );

        }


        const contentType =
            response.headers.get(
                "content-type"
            ) || "";


        let result;


        if (
            contentType.includes(
                "application/json"
            )
        ) {

            result =
                await response.json();

        } else {

            result =
                await response.text();

        }


        const translated =
            extractTranslation(
                result
            );


        if (!translated) {

            /*
               If API returns empty,
               preserve original text.
            */

            translatedChunks.push(
                chunk
            );

        } else {

            translatedChunks.push(
                translated
            );

        }


        await sleep(20);

    }


    return translatedChunks.join(
        " "
    );

}


/* =========================================================
   SPLIT TEXT
   ========================================================= */

function splitTextForTranslation(
    text,
    maxLength
) {

    if (
        text.length <=
        maxLength
    ) {

        return [text];

    }


    const chunks =
        [];

    let current =
        "";


    const words =
        text.split(
            /\s+/
        );


    for (
        const word of words
    ) {

        if (
            (
                current.length +
                word.length +
                1
            ) <=
            maxLength
        ) {

            current +=
                (
                    current
                        ? " "
                        : ""
                ) + word;

        } else {

            if (current) {

                chunks.push(
                    current
                );

            }

            current =
                word;

        }

    }


    if (current) {

        chunks.push(
            current
        );

    }


    return chunks;

}


/* =========================================================
   EXTRACT TRANSLATION FROM API RESPONSE
   ========================================================= */

function extractTranslation(
    result
) {

    if (
        result ===
        null ||
        result ===
        undefined
    ) {

        return "";

    }


    if (
        typeof result ===
        "string"
    ) {

        return result.trim();

    }


    /*
       Common API response formats
    */

    const possibleKeys = [

        "translation",

        "translatedText",

        "translated",

        "text",

        "result",

        "response",

        "data"

    ];


    for (
        const key of possibleKeys
    ) {

        if (
            typeof result[key] ===
            "string"
        ) {

            return result[key].trim();

        }

    }


    /*
       Nested data
    */

    if (
        result.data &&
        typeof result.data ===
        "object"
    ) {

        return extractTranslation(
            result.data
        );

    }


    /*
       Array response
    */

    if (
        Array.isArray(result) &&
        result.length
    ) {

        return extractTranslation(
            result[0]
        );

    }


    return "";

}


/* =========================================================
   OCR LINE BOXES
   ========================================================= */

function getOCRLines(
    data
) {

    if (
        !data ||
        !Array.isArray(
            data.lines
        )
    ) {

        return [];

    }


    const lines =
        [];


    for (
        const line of data.lines
    ) {

        if (
            !line ||
            !line.bbox
        ) {

            continue;

        }


        const text =
            cleanOCRLine(
                line.text
            );


        if (!text) {

            continue;

        }


        const confidence =
            Number(
                line.confidence ||
                0
            );


        /*
           Ignore extremely poor OCR.
        */

        if (
            confidence < 20 &&
            text.length < 3
        ) {

            continue;

        }


        const bbox =
            line.bbox;


        lines.push({

            text,

            confidence,

            x0: Number(
                bbox.x0 || 0
            ),

            y0: Number(
                bbox.y0 || 0
            ),

            x1: Number(
                bbox.x1 || 0
            ),

            y1: Number(
                bbox.y1 || 0
            )

        });

    }


    return lines;

}


/* =========================================================
   GROUP OCR LINES
   =========================================================

   We keep individual lines where possible because that
   helps preserve tables and column positions.

========================================================= */

function groupOCRLines(
    lines
) {

    if (
        !lines.length
    ) {

        return [];

    }


    /*
       Sort top-to-bottom and left-to-right.
    */

    const sorted =
        [...lines].sort(
            (a, b) => {

                const ay =
                    a.y0;

                const by =
                    b.y0;


                if (
                    Math.abs(
                        ay - by
                    ) < 10
                ) {

                    return (
                        a.x0 -
                        b.x0
                    );

                }


                return ay - by;

            }
        );


    return sorted;

}


/* =========================================================
   SAMPLE BACKGROUND COLOR
   ========================================================= */

function getBackgroundColor(
    canvas,
    x,
    y,
    width,
    height
) {

    try {

        const context =
            canvas.getContext(
                "2d",
                {
                    willReadFrequently: true
                }
            );


        const padding =
            4;


        const sx =
            Math.max(
                0,
                Math.floor(
                    x - padding
                )
            );


        const sy =
            Math.max(
                0,
                Math.floor(
                    y - padding
                )
            );


        const sw =
            Math.min(
                canvas.width - sx,
                Math.max(
                    1,
                    Math.floor(
                        width +
                        padding * 2
                    )
                )
            );


        const sh =
            Math.min(
                canvas.height - sy,
                Math.max(
                    1,
                    Math.floor(
                        height +
                        padding * 2
                    )
                )
            );


        const imageData =
            context.getImageData(
                sx,
                sy,
                sw,
                sh
            );


        let r = 0;
        let g = 0;
        let b = 0;
        let count = 0;


        /*
           Sample mostly light pixels.

           This helps prevent white rectangles from
           appearing over colored backgrounds.
        */

        for (
            let i = 0;
            i <
            imageData.data.length;
            i += 4
        ) {

            const rr =
                imageData.data[i];

            const gg =
                imageData.data[i + 1];

            const bb =
                imageData.data[i + 2];


            const brightness =
                (
                    rr +
                    gg +
                    bb
                ) / 3;


            if (
                brightness > 180
            ) {

                r += rr;
                g += gg;
                b += bb;

                count++;

            }

        }


        if (
            count === 0
        ) {

            return {
                r: 255,
                g: 255,
                b: 255
            };

        }


        return {

            r: Math.round(
                r / count
            ),

            g: Math.round(
                g / count
            ),

            b: Math.round(
                b / count
            )

        };

    } catch (error) {

        console.warn(
            "Background sampling failed:",
            error
        );


        return {

            r: 255,
            g: 255,
            b: 255

        };

    }

}


/* =========================================================
   CHECK WHETHER BOX SHOULD BE COVERED
   ========================================================= */

function shouldCoverText(
    line
) {

    const width =
        line.x1 -
        line.x0;


    const height =
        line.y1 -
        line.y0;


    /*
       Very tiny OCR fragments can be noise.

       Keep punctuation and short labels if they
       have reasonable dimensions.
    */

    if (
        width < 3 ||
        height < 3
    ) {

        return false;

    }


    if (
        !line.text ||
        !line.text.trim()
    ) {

        return false;

    }


    return true;

}


/* =========================================================
   ESTIMATE FONT SIZE
   ========================================================= */

function estimateFontSize(
    line,
    translatedText
) {

    const originalHeight =
        Math.max(
            8,
            line.y1 -
            line.y0
        );


    /*
       PDF.js canvas is rendered at scale 2.

       jsPDF is created in points using the original
       PDF dimensions, so convert approximately back
       to PDF points.
    */

    let fontSize =
        originalHeight *
        0.72;


    /*
       If translated text is much longer,
       reduce the font slightly.
    */

    const originalLength =
        Math.max(
            1,
            line.text.length
        );


    const translatedLength =
        Math.max(
            1,
            translatedText.length
        );


    const ratio =
        translatedLength /
        originalLength;


    if (
        ratio > 1.5
    ) {

        fontSize *=
            0.85;

    }


    if (
        ratio > 2.5
    ) {

        fontSize *=
            0.72;

    }


    return Math.max(
        5,
        Math.min(
            32,
            fontSize
        )
    );

}


/* =========================================================
   CALCULATE PDF PAGE SIZE
   ========================================================= */

function getPDFPageSize(
    page
) {

    const view =
        page.getViewport({
            scale: 1
        });


    return {

        width:
            view.width,

        height:
            view.height

    };

}


/* =========================================================
   CREATE jsPDF DOCUMENT
   ========================================================= */

function createPDFDocument(
    pageWidth,
    pageHeight
) {

    if (
        typeof window.jspdf ===
        "undefined"
    ) {

        throw new Error(
            "jsPDF could not be loaded."
        );

    }


    if (
        typeof window.jspdf.jsPDF !==
        "function"
    ) {

        throw new Error(
            "jsPDF constructor is unavailable."
        );

    }


    const {
        jsPDF
    } =
        window.jspdf;


    const orientation =
        pageWidth >
        pageHeight
            ? "landscape"
            : "portrait";


    /*
       Custom page size ensures that the generated
       PDF has the same dimensions as the source page.
    */

    return new jsPDF({

        orientation,

        unit: "pt",

        format: [
            pageWidth,
            pageHeight
        ],

        compress: true

    });

}


/* =========================================================
   CONVERT CANVAS TO IMAGE
   ========================================================= */

function canvasToJPEG(
    canvas
) {

    return canvas.toDataURL(
        "image/jpeg",
        JPEG_QUALITY
    );

}


/* =========================================================
   DRAW TRANSLATED TEXT
   ========================================================= */

function drawTranslatedText(
    pdf,
    line,
    translatedText,
    canvas,
    renderScale,
    pageWidth,
    pageHeight
) {

    if (
        !translatedText
    ) {

        return;

    }


    /*
       OCR coordinates are based on the rendered canvas.

       Convert them back to PDF points.
    */

    const x =
        line.x0 /
        renderScale;


    const y =
        line.y0 /
        renderScale;


    const width =
        (
            line.x1 -
            line.x0
        ) /
        renderScale;


    const height =
        (
            line.y1 -
            line.y0
        ) /
        renderScale;


    if (
        width <= 1 ||
        height <= 1
    ) {

        return;

    }


    /*
       Keep the cover slightly larger than OCR box.
    */

    const paddingX =
        Math.max(
            1,
            height * 0.12
        );


    const paddingY =
        Math.max(
            1,
            height * 0.10
        );


    /*
       Get approximate background color.

       This preserves white / light backgrounds much
       better than blindly using white.
    */

    const bg =
        getBackgroundColor(
            canvas,
            line.x0,
            line.y0,
            line.x1 - line.x0,
            line.y1 - line.y0
        );


    pdf.setFillColor(
        bg.r,
        bg.g,
        bg.b
    );


    /*
       Cover original OCR text.

       We intentionally don't cover the entire table cell.
       Only the detected text area is covered.
    */

    pdf.rect(

        Math.max(
            0,
            x - paddingX
        ),

        Math.max(
            0,
            y - paddingY
        ),

        Math.min(
            pageWidth -
            x +
            paddingX,
            width +
            paddingX * 2
        ),

        Math.min(
            pageHeight -
            y +
            paddingY,
            height +
            paddingY * 2
        ),

        "F"

    );


    /*
       Font size.
    */

    const fontSize =
        estimateFontSize(
            line,
            translatedText
        );


    pdf.setFont(
        "helvetica",
        "normal"
    );


    pdf.setFontSize(
        fontSize
    );


    pdf.setTextColor(
        0,
        0,
        0
    );


    /*
       jsPDF text baseline is different from OCR y0.

       Put the baseline approximately near the original
       text baseline.
    */

    const baselineY =
        y +
        Math.min(
            height * 0.82,
            fontSize * 1.05
        );


    /*
       Split translated text to fit approximately inside
       the original text box.

       jsPDF's splitTextToSize handles wrapping.
    */

    const maxTextWidth =
        Math.max(
            10,
            width -
            paddingX * 2
        );


    const wrapped =
        pdf.splitTextToSize(
            translatedText,
            maxTextWidth
        );


    /*
       Limit excessive vertical expansion.

       If translated text is much longer than the original,
       reduce font size before drawing.
    */

    let finalFontSize =
        fontSize;


    if (
        wrapped.length > 2
    ) {

        finalFontSize =
            Math.max(
                5,
                fontSize * 0.80
            );

        pdf.setFontSize(
            finalFontSize
        );

    }


    const lineHeight =
        finalFontSize *
        1.15;


    const maximumLines =
        Math.max(
            1,
            Math.floor(
                (
                    height +
                    paddingY * 2
                ) /
                lineHeight
            )
        );


    const finalLines =
        wrapped.slice(
            0,
            Math.max(
                1,
                Math.min(
                    maximumLines,
                    3
                )
            )
        );


    pdf.text(

        finalLines,

        x + paddingX,

        baselineY,

        {
            baseline:
                "alphabetic",

            maxWidth:
                maxTextWidth

        }

    );

}


/* =========================================================
   PROCESS SINGLE PAGE
   ========================================================= */

async function processPDFPage(
    pdfDocument,
    pageNumber,
    totalPages,
    outputPdf
) {

    setPDFStatus(
        `📄 Loading page ${pageNumber} of ${totalPages}...`
    );


    const page =
        await pdfDocument.getPage(
            pageNumber
        );


    /*
       Original PDF page dimensions.
    */

    const pageSize =
        getPDFPageSize(
            page
        );


    const pageWidth =
        pageSize.width;


    const pageHeight =
        pageSize.height;


    /*
       Render high resolution canvas.
    */

    const rendered =
        await renderPDFPage(
            page
        );


    const canvas =
        rendered.canvas;


    /*
       OCR
    */

    const ocrData =
        await OCRPDFPage(
            canvas,
            pageNumber,
            totalPages
        );


    let lines =
        getOCRLines(
            ocrData
        );


    lines =
        groupOCRLines(
            lines
        );


    console.log(
        `Page ${pageNumber}: ${lines.length} OCR lines`
    );


    /*
       Translation
    */

    const {
        sl,
        tl
    } =
        getTranslationLanguages();


    const translatedLines =
        [];


    for (
        let i = 0;
        i < lines.length;
        i++
    ) {

        const line =
            lines[i];


        setPDFStatus(

            `🌎 Translating page ${pageNumber}/${totalPages} — ` +
            `${i + 1}/${lines.length}`

        );


        let translated;


        try {

            translated =
                await translateText(
                    line.text,
                    sl,
                    tl
                );

        } catch (error) {

            console.warn(
                "Translation failed for line:",
                line.text,
                error
            );


            /*
               Preserve original OCR text if translation
               fails for an individual line.
            */

            translated =
                line.text;

        }


        translatedLines.push({

            ...line,

            translated

        });


        /*
           Give browser UI a chance to update.
        */

        await sleep(5);

    }


    /*
       First page creates the document.
    */

    if (
        pageNumber === 1
    ) {

        /*
           The document has already been created by the
           caller. Nothing needed here.
        */

    } else {

        outputPdf.addPage(

            [
                pageWidth,
                pageHeight
            ]

        );

    }


    /*
       Add original page as full-page background.

       THIS is the important part for preserving:

       ✓ tables
       ✓ borders
       ✓ logos
       ✓ photos
       ✓ signatures
       ✓ stamps
       ✓ background graphics
       ✓ original positioning

    */

    const pageImage =
        canvasToJPEG(
            canvas
        );


    outputPdf.addImage(

        pageImage,

        "JPEG",

        0,

        0,

        pageWidth,

        pageHeight,

        undefined,

        "FAST"

    );


    /*
       Overlay translated text.

       Since the original page is underneath, anything not
       recognized as text remains exactly as rendered.
    */

    setPDFStatus(
        `✏️ Placing translated text on page ${pageNumber}...`
    );


    for (
        const translatedLine
        of translatedLines
    ) {

        if (
            !shouldCoverText(
                translatedLine
            )
        ) {

            continue;

        }


        if (
            !translatedLine.translated
        ) {

            continue;

        }


        drawTranslatedText(

            outputPdf,

            translatedLine,

            translatedLine.translated,

            canvas,

            PDF_RENDER_SCALE,

            pageWidth,

            pageHeight

        );

    }


    /*
       Update global progress.
    */

    const percent =
        Math.round(
            (
                pageNumber /
                totalPages
            ) * 100
        );


    setPDFProgress(
        percent
    );


    return {

        pageNumber,

        pageWidth,

        pageHeight,

        ocrLines:
            lines.length

    };

}


/* =========================================================
   PROCESS PDF
   ========================================================= */

async function processPDF(
    file
) {

    clearPDFError();

    checkPDFLibraries();


    if (
        !file
    ) {

        return;

    }


    if (
        file.type !==
        "application/pdf"
    ) {

        throw new Error(
            "Please select a PDF file."
        );

    }


    /*
       Basic size warning.

       Large PDFs require more browser memory because
       each page is rendered as an image.
    */

    const maxRecommendedSize =
        50 * 1024 * 1024;


    if (
        file.size >
        maxRecommendedSize
    ) {

        console.warn(
            "Large PDF:",
            file.size
        );

    }


    setPDFStatus(
        "📥 Reading PDF..."
    );


    setPDFProgress(
        2
    );


    const arrayBuffer =
        await file.arrayBuffer();


    setPDFStatus(
        "📖 Opening PDF..."
    );


    const loadingTask =
        pdfjsLib.getDocument({

            data:
                arrayBuffer

        });


    const pdfDocument =
        await loadingTask.promise;


    const totalPages =
        pdfDocument.numPages;


    if (
        !totalPages
    ) {

        throw new Error(
            "The PDF contains no pages."
        );

    }


    console.log(
        "PDF pages:",
        totalPages
    );


    /*
       Get first page so we can create the output PDF
       with exactly the same page size.
    */

    const firstPage =
        await pdfDocument.getPage(
            1
        );


    const firstPageSize =
        getPDFPageSize(
            firstPage
        );


    const outputPdf =
        createPDFDocument(

            firstPageSize.width,

            firstPageSize.height

        );


    /*
       Process all pages.
    */

    for (
        let pageNumber = 1;
        pageNumber <= totalPages;
        pageNumber++
    ) {

        await processPDFPage(

            pdfDocument,

            pageNumber,

            totalPages,

            outputPdf

        );

    }


    /*
       PDF metadata.
    */

    try {

        outputPdf.setProperties({

            title:
                `Translated - ${file.name}`,

            subject:
                "OCR translated PDF",

            author:
                "Dhiren Translate",

            creator:
                "Dhiren Translate"

        });

    } catch (error) {

        console.warn(
            "Could not set PDF metadata:",
            error
        );

    }


    setPDFStatus(
        "💾 Creating translated PDF..."
    );


    setPDFProgress(
        98
    );


    /*
       Remove .pdf from original filename.
    */

    const originalName =
        file.name
            .replace(
                /\.pdf$/i,
                ""
            );


    const outputName =
        `translated_${originalName}.pdf`;


    /*
       Save/download.
    */

    outputPdf.save(
        outputName
    );


    setPDFProgress(
        100
    );


    setPDFStatus(
        `✅ PDF translation complete — ${totalPages} page${totalPages === 1 ? "" : "s"}`
    );


    /*
       Put a useful amount of OCR text into the existing
       source textarea.

       Do not exceed the existing 5000-character limit.
    */

    try {

        const allOCR =
            [];


        /*
           We don't have all OCR text stored globally here,
           so leave the existing source box alone rather than
           accidentally overwriting user's text.
        */

        void allOCR;

    } catch (error) {

        console.warn(
            error
        );

    }


    /*
       Update translation status.
    */

    if (translationStatus) {

        translationStatus.textContent =
            `PDF ready: ${outputName}`;

    }


    return {

        fileName:
            outputName,

        pages:
            totalPages

    };

}


/* =========================================================
   FILE INPUT EVENT
   ========================================================= */

if (pdfInput) {

    pdfInput.addEventListener(
        "change",
        async function(event) {

            const file =
                event.target.files &&
                event.target.files[0];


            if (!file) {

                return;

            }


            /*
               Prevent repeated PDF processing.
            */

            pdfInput.disabled =
                true;


            if (translateButton) {

                translateButton.disabled =
                    true;

            }


            if (translateButtonText) {

                translateButtonText.textContent =
                    "Processing PDF...";

            }


            if (translateSpinner) {

                translateSpinner.classList.remove(
                    "hidden"
                );

            }


            try {

                await processPDF(
                    file
                );


            } catch (error) {

                console.error(
                    "PDF processing failed:",
                    error
                );


                showPDFError(

                    "PDF processing failed: " +
                    (
                        error &&
                        error.message
                            ? error.message
                            : "Unknown error"
                    )

                );

            } finally {

                pdfInput.disabled =
                    false;


                if (translateButton) {

                    translateButton.disabled =
                        false;

                }


                if (translateButtonText) {

                    translateButtonText.textContent =
                        "Translate";

                }


                if (translateSpinner) {

                    translateSpinner.classList.add(
                        "hidden"
                    );

                }


                /*
                   Allow selecting the same PDF again.
                */

                pdfInput.value =
                    "";

            }

        }
    );

}


/* =========================================================
   INITIAL LIBRARY DIAGNOSTICS
   ========================================================= */

console.log(
    "----------------------------------------"
);

console.log(
    "Dhiren Translate PDF module loaded"
);

console.log(
    "PDF.js:",
    typeof pdfjsLib !== "undefined"
        ? pdfjsLib.version
        : "NOT LOADED"
);

console.log(
    "jsPDF:",
    typeof window.jspdf !== "undefined" &&
    typeof window.jspdf.jsPDF === "function"
        ? "READY"
        : "NOT LOADED"
);

console.log(
    "Tesseract:",
    typeof Tesseract !== "undefined"
        ? "READY"
        : "NOT LOADED"
);

console.log(
    "----------------------------------------"
);
