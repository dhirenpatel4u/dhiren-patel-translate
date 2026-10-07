"use strict";

/*
===========================================================
 DHIREN TRANSLATE
 PDF OCR + TRANSLATION
===========================================================

 Supported PDF Translation:
    Hindi    -> hi
    Marathi  -> mr
    Gujarati -> gu

 Fonts:
    /fonts/NotoSansDevanagari-Regular.ttf
    /fonts/NotoSansGujarati-Regular.ttf

 Translation API:
    /api/?sl=SOURCE&tl=TARGET&q=TEXT
===========================================================
*/


console.log("====================================");
console.log("Dhiren Translate PDF module starting");
console.log("====================================");


/* =========================================================
   ELEMENTS
   ========================================================= */

const pdfInput =
    document.getElementById("pdfInput");

const pdfStatus =
    document.getElementById("ocrStatus");

const pdfProgressContainer =
    document.getElementById(
        "ocrProgressContainer"
    );

const pdfProgress =
    document.getElementById(
        "ocrProgress"
    );

const pdfError =
    document.getElementById(
        "errorMessage"
    );

const pdfTranslationStatus =
    document.getElementById(
        "translationStatus"
    );

const pdfSourceLanguage =
    document.getElementById(
        "sourceLanguage"
    );

const pdfTargetLanguage =
    document.getElementById(
        "targetLanguage"
    );


/* =========================================================
   CONFIGURATION
   ========================================================= */

const PDF_RENDER_SCALE = 2;

const PDF_JPEG_QUALITY = 0.90;

const PDF_WORKER_URL =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";


/* =========================================================
   PDF TRANSLATION LANGUAGES
   ========================================================= */

const PDF_SUPPORTED_LANGUAGES = {

    hi: {
        name: "Hindi",
        fontFile:
            "/fonts/NotoSansDevanagari-Regular.ttf",
        fontName:
            "NotoSansDevanagari"
    },

    mr: {
        name: "Marathi",
        fontFile:
            "/fonts/NotoSansDevanagari-Regular.ttf",
        fontName:
            "NotoSansDevanagari"
    },

    gu: {
        name: "Gujarati",
        fontFile:
            "/fonts/NotoSansGujarati-Regular.ttf",
        fontName:
            "NotoSansGujarati"
    }

};


/* =========================================================
   FONT CACHE
   ========================================================= */

const pdfFontCache = {};


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
   STATUS
   ========================================================= */

function pdfSetStatus(message) {

    console.log(
        "[PDF]",
        message
    );

    if (pdfStatus) {

        pdfStatus.textContent =
            message;

        pdfStatus.classList.remove(
            "hidden"
        );
    }
}


/* =========================================================
   TRANSLATION STATUS
   ========================================================= */

function pdfSetTranslationStatus(message) {

    console.log(
        "[PDF TRANSLATION]",
        message
    );

    if (pdfTranslationStatus) {

        pdfTranslationStatus.textContent =
            message;

        pdfTranslationStatus.classList.remove(
            "hidden"
        );
    }
}


/* =========================================================
   PROGRESS
   ========================================================= */

function pdfSetProgress(value) {

    const safeValue =
        Math.max(
            0,
            Math.min(
                100,
                Number(value) || 0
            )
        );


    if (pdfProgressContainer) {

        pdfProgressContainer.classList.remove(
            "hidden"
        );
    }


    if (pdfProgress) {

        pdfProgress.style.width =
            safeValue + "%";

        /*
         * If progress element is a native
         * progress element.
         */

        if (
            "value" in pdfProgress
        ) {

            pdfProgress.value =
                safeValue;
        }
    }
}


/* =========================================================
   HIDE PROGRESS
   ========================================================= */

function pdfHideProgress() {

    if (pdfProgressContainer) {

        pdfProgressContainer.classList.add(
            "hidden"
        );
    }


    if (pdfProgress) {

        pdfProgress.style.width =
            "0%";

        if (
            "value" in pdfProgress
        ) {

            pdfProgress.value = 0;
        }
    }
}


/* =========================================================
   CLEAR ERROR
   ========================================================= */

function pdfClearError() {

    if (pdfError) {

        pdfError.textContent =
            "";

        pdfError.classList.add(
            "hidden"
        );
    }
}


/* =========================================================
   SHOW ERROR
   ========================================================= */

function pdfShowError(message) {

    console.error(
        "[PDF ERROR]",
        message
    );


    if (pdfError) {

        pdfError.textContent =
            "❌ " + String(message);

        pdfError.classList.remove(
            "hidden"
        );
    }


    pdfSetStatus(
        "❌ " + String(message)
    );
}


/* =========================================================
   CHECK LIBRARIES
   ========================================================= */

function pdfCheckLibraries() {

    console.log(
        "Checking PDF libraries..."
    );


    console.log(
        "PDF.js:",
        typeof window.pdfjsLib
    );


    console.log(
        "Tesseract:",
        typeof window.Tesseract
    );


    console.log(
        "jsPDF:",
        typeof window.jspdf
    );


    if (
        typeof window.pdfjsLib ===
        "undefined"
    ) {

        throw new Error(
            "PDF.js is not loaded."
        );
    }


    if (
        typeof window.Tesseract ===
        "undefined"
    ) {

        throw new Error(
            "Tesseract.js is not loaded."
        );
    }


    if (
        typeof window.jspdf ===
        "undefined"
    ) {

        throw new Error(
            "jsPDF is not loaded."
        );
    }


    if (
        typeof window.jspdf.jsPDF !==
        "function"
    ) {

        throw new Error(
            "jsPDF constructor is not available."
        );
    }


    console.log(
        "All PDF libraries loaded successfully."
    );
}


/* =========================================================
   INITIALIZE PDF.JS
   ========================================================= */

function pdfInitializePDFJS() {

    if (
        typeof window.pdfjsLib ===
        "undefined"
    ) {

        return;
    }


    window.pdfjsLib
        .GlobalWorkerOptions
        .workerSrc =
            PDF_WORKER_URL;


    console.log(
        "PDF.js worker configured."
    );
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
            pdfSourceLanguage.value ||
            "auto"
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
            pdfTargetLanguage.value ||
            ""
        )
        .trim()
        .toLowerCase();


    return value;
}


/* =========================================================
   NORMALIZE LANGUAGE
   ========================================================= */

function pdfNormalizeLanguage(language) {

    return String(
        language || ""
    )
        .trim()
        .toLowerCase()
        .split("-")[0]
        .split("_")[0];
}


/* =========================================================
   GET PDF LANGUAGE CONFIG
   ========================================================= */

function pdfGetPDFLanguageConfig() {

    const target =
        pdfNormalizeLanguage(
            pdfGetTargetLanguage()
        );


    return (
        PDF_SUPPORTED_LANGUAGES[target] ||
        null
    );
}


/* =========================================================
   GET OCR LANGUAGE
   ========================================================= */

function pdfGetOCRLanguage() {

    const source =
        pdfNormalizeLanguage(
            pdfGetSourceLanguage()
        );


    return (
        PDF_OCR_LANGUAGE_MAP[source] ||
        "eng"
    );
}


/* =========================================================
   LOAD FONT
   ========================================================= */

async function pdfLoadFont(
    fontFile
) {

    if (
        pdfFontCache[fontFile]
    ) {

        console.log(
            "Using cached font:",
            fontFile
        );

        return pdfFontCache[fontFile];
    }


    console.log(
        "Loading PDF font:",
        fontFile
    );


    const response =
        await fetch(
            fontFile,
            {
                method: "GET",
                cache: "force-cache"
            }
        );


    if (!response.ok) {

        throw new Error(
            "Could not load PDF font: " +
            fontFile +
            " (HTTP " +
            response.status +
            ")"
        );
    }


    const buffer =
        await response.arrayBuffer();


    if (
        !buffer ||
        buffer.byteLength === 0
    ) {

        throw new Error(
            "PDF font file is empty: " +
            fontFile
        );
    }


    const bytes =
        new Uint8Array(
            buffer
        );


    let binary = "";

    const chunkSize =
        0x8000;


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
            String.fromCharCode(
                ...chunk
            );
    }


    const base64 =
        btoa(binary);


    pdfFontCache[fontFile] =
        base64;


    console.log(
        "Font loaded successfully:",
        fontFile,
        "bytes:",
        buffer.byteLength
    );


    return base64;
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

    const jsPDF =
        window.jspdf.jsPDF;


    const pdf =
        new jsPDF({

            orientation:
                width > height
                    ? "landscape"
                    : "portrait",

            unit:
                "pt",

            format:
                [
                    width,
                    height
                ],

            compress:
                true
        });


    const fontFileName =
        fontInfo.fontFile
            .split("/")
            .pop();


    console.log(
        "Registering PDF font:",
        fontFileName
    );


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


    console.log(
        "PDF Unicode font registered:",
        fontInfo.fontName
    );


    return pdf;
}


/* =========================================================
   LOAD PDF
   ========================================================= */

async function pdfLoadDocument(
    file
) {

    pdfSetStatus(
        "📖 Reading PDF..."
    );


    pdfSetProgress(
        5
    );


    const buffer =
        await file.arrayBuffer();


    if (
        !buffer ||
        buffer.byteLength === 0
    ) {

        throw new Error(
            "The selected PDF is empty."
        );
    }


    console.log(
        "PDF bytes:",
        buffer.byteLength
    );


    const loadingTask =
        window.pdfjsLib.getDocument({

            data:
                new Uint8Array(
                    buffer
                )
        });


    const pdf =
        await loadingTask.promise;


    console.log(
        "PDF successfully loaded."
    );


    console.log(
        "PDF pages:",
        pdf.numPages
    );


    return pdf;
}


/* =========================================================
   RENDER PDF PAGE
   ========================================================= */

async function pdfRenderPage(
    page
) {

    const viewport =
        page.getViewport({

            scale:
                PDF_RENDER_SCALE
        });


    const canvas =
        document.createElement(
            "canvas"
        );


    canvas.width =
        Math.ceil(
            viewport.width
        );


    canvas.height =
        Math.ceil(
            viewport.height
        );


    const context =
        canvas.getContext(
            "2d",
            {
                willReadFrequently:
                    true
            }
        );


    if (!context) {

        throw new Error(
            "Could not create PDF canvas."
        );
    }


    await page.render({

        canvasContext:
            context,

        viewport:
            viewport

    }).promise;


    return {

        canvas:
            canvas,

        viewport:
            viewport
    };
}


/* =========================================================
   CREATE OCR WORKER
   ========================================================= */

async function pdfCreateOCRWorker() {

    const language =
        pdfGetOCRLanguage();


    console.log(
        "Creating Tesseract worker:",
        language
    );


    pdfSetStatus(
        "🔤 Loading OCR engine..."
    );


    const worker =
        await window.Tesseract.createWorker(

            language,

            1,

            {

                logger:
                    function(info) {

                        if (
                            info &&
                            info.status ===
                            "loading language"
                        ) {

                            console.log(
                                "OCR language loading:",
                                Math.round(
                                    (
                                        info.progress ||
                                        0
                                    ) * 100
                                ) + "%"
                            );
                        }


                        if (
                            info &&
                            info.status ===
                            "recognizing text"
                        ) {

                            console.log(
                                "OCR progress:",
                                Math.round(
                                    (
                                        info.progress ||
                                        0
                                    ) * 100
                                ) + "%"
                            );
                        }
                    }
            }
        );


    console.log(
        "Tesseract worker ready."
    );


    return worker;
}


/* =========================================================
   OCR PAGE
   ========================================================= */

async function pdfOCRPage(
    worker,
    canvas,
    pageNumber,
    totalPages
) {

    pdfSetStatus(

        `🔍 OCR page ${pageNumber} of ${totalPages}...`

    );


    const result =
        await worker.recognize(
            canvas
        );


    if (
        !result ||
        !result.data
    ) {

        throw new Error(
            "OCR returned no data for page " +
            pageNumber
        );
    }


    console.log(
        "OCR completed for page:",
        pageNumber
    );


    return result.data;
}


/* =========================================================
   GET OCR LINES
   ========================================================= */

function pdfGetOCRLines(
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


    return data.lines

        .filter(
            function(line) {

                return (
                    line &&
                    line.text &&
                    line.bbox
                );
            }
        )

        .map(
            function(line) {

                return {

                    text:
                        String(
                            line.text
                        )
                        .replace(
                            /\s+/g,
                            " "
                        )
                        .trim(),

                    confidence:
                        Number(
                            line.confidence ||
                            0
                        ),

                    x0:
                        Number(
                            line.bbox.x0 ||
                            0
                        ),

                    y0:
                        Number(
                            line.bbox.y0 ||
                            0
                        ),

                    x1:
                        Number(
                            line.bbox.x1 ||
                            0
                        ),

                    y1:
                        Number(
                            line.bbox.y1 ||
                            0
                        )
                };
            }
        )

        .filter(
            function(line) {

                return (
                    line.text.length >
                    0
                );
            }
        );
}


/* =========================================================
   TRANSLATION API
   ========================================================= */

function API_BASE_FOR_PDF(
    sourceLanguage,
    targetLanguage,
    text
) {

    return (

        "/api/?" +

        "sl=" +
        encodeURIComponent(
            sourceLanguage
        ) +

        "&tl=" +
        encodeURIComponent(
            targetLanguage
        ) +

        "&q=" +
        encodeURIComponent(
            text
        )
    );
}


/* =========================================================
   TRANSLATE TEXT
   ========================================================= */

async function pdfTranslateText(
    text
) {

    const sourceLanguage =
        pdfGetSourceLanguage();


    const targetLanguage =
        pdfGetTargetLanguage();


    const cleanText =
        String(
            text || ""
        ).trim();


    if (!cleanText) {

        return "";
    }


    /*
     * Same language.
     */

    if (
        pdfNormalizeLanguage(
            sourceLanguage
        ) ===
        pdfNormalizeLanguage(
            targetLanguage
        )
    ) {

        return cleanText;
    }


    const url =
        API_BASE_FOR_PDF(

            sourceLanguage,

            targetLanguage,

            cleanText

        );


    console.log(
        "Translation request:",
        cleanText
    );


    console.log(
        "Translation URL:",
        url
    );


    let response;


    try {

        response =
            await fetch(

                url,

                {

                    method:
                        "GET",

                    headers: {

                        Accept:
                            "application/json,text/plain,*/*"
                    }
                }
            );

    } catch (
        networkError
    ) {

        throw new Error(
            "Could not connect to translation API. " +
            "Please check /api/ deployment."
        );
    }


    console.log(
        "Translation HTTP status:",
        response.status
    );


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

        try {

            data =
                await response.json();

        } catch (
            jsonError
        ) {

            throw new Error(
                "Translation API returned invalid JSON."
            );
        }

    } else {

        data =
            await response.text();
    }


    console.log(
        "Translation API response:",
        data
    );


    if (
        !response.ok
    ) {

        let errorMessage =
            "Translation API error: HTTP " +
            response.status;


        if (
            typeof data ===
            "string" &&
            data.trim()
        ) {

            errorMessage +=
                " - " +
                data
                    .trim()
                    .substring(
                        0,
                        300
                    );

        } else if (
            data &&
            typeof data.error ===
            "string"
        ) {

            errorMessage +=
                " - " +
                data.error;
        }


        throw new Error(
            errorMessage
        );
    }


    const translated =
        pdfExtractTranslation(
            data
        );


    if (
        !translated
    ) {

        throw new Error(
            "Translation API returned an empty translation."
        );
    }


    return translated;
}


/* =========================================================
   EXTRACT TRANSLATION
   ========================================================= */

function pdfExtractTranslation(
    data
) {

    if (
        typeof data ===
        "string"
    ) {

        return data.trim();
    }


    if (!data) {

        return "";
    }


    const keys = [

        "translation",

        "translatedText",

        "translated_text",

        "translated",

        "result",

        "response",

        "text"
    ];


    for (
        const key of keys
    ) {

        if (
            typeof data[key] ===
            "string"
        ) {

            return data[key].trim();
        }
    }


    /*
     * Nested data.
     */

    if (
        data.data !==
        undefined
    ) {

        if (
            typeof data.data ===
            "string"
        ) {

            return data.data.trim();
        }


        if (
            typeof data.data ===
            "object"
        ) {

            const nested =
                pdfExtractTranslation(
                    data.data
                );


            if (nested) {

                return nested;
            }
        }
    }


    /*
     * Array response.
     */

    if (
        Array.isArray(data)
    ) {

        const parts = [];


        for (
            const item of data
        ) {

            if (
                typeof item ===
                "string"
            ) {

                parts.push(
                    item
                );

            } else {

                const itemText =
                    pdfExtractTranslation(
                        item
                    );


                if (
                    itemText
                ) {

                    parts.push(
                        itemText
                    );
                }
            }
        }


        return parts
            .join(" ")
            .trim();
    }


    return "";
}


/* =========================================================
   GET BACKGROUND COLOR
   ========================================================= */

function pdfGetBackgroundColor(
    canvas,
    line
) {

    try {

        const ctx =
            canvas.getContext(
                "2d",
                {
                    willReadFrequently:
                        true
                }
            );


        if (!ctx) {

            return {

                r: 255,
                g: 255,
                b: 255
            };
        }


        const x =
            Math.max(
                0,
                Math.floor(
                    line.x0
                )
            );


        const y =
            Math.max(
                0,
                Math.floor(
                    line.y0
                )
            );


        const width =
            Math.min(

                Math.max(
                    1,
                    Math.floor(
                        line.x1 -
                        line.x0
                    )
                ),

                canvas.width -
                x

            );


        const height =
            Math.min(

                Math.max(
                    1,
                    Math.floor(
                        line.y1 -
                        line.y0
                    )
                ),

                canvas.height -
                y

            );


        if (
            width <= 0 ||
            height <= 0
        ) {

            return {

                r: 255,
                g: 255,
                b: 255
            };
        }


        const image =
            ctx.getImageData(

                x,
                y,
                width,
                height

            );


        let r = 0;
        let g = 0;
        let b = 0;
        let count = 0;


        for (
            let i = 0;
            i <
            image.data.length;
            i += 4
        ) {

            const rr =
                image.data[i];

            const gg =
                image.data[i + 1];

            const bb =
                image.data[i + 2];


            /*
             * Count bright pixels.
             */

            if (
                rr > 180 &&
                gg > 180 &&
                bb > 180
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

            r:
                Math.round(
                    r / count
                ),

            g:
                Math.round(
                    g / count
                ),

            b:
                Math.round(
                    b / count
                )
        };


    } catch (
        error
    ) {

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
   DRAW TRANSLATED TEXT
   ========================================================= */

function pdfDrawTranslatedText(
    pdf,
    canvas,
    line,
    translated,
    pageWidth,
    pageHeight,
    fontInfo
) {

    if (
        !translated ||
        !String(translated).trim()
    ) {

        return;
    }


    const scale =
        PDF_RENDER_SCALE;


    const x =
        line.x0 /
        scale;


    const y =
        line.y0 /
        scale;


    const width =
        (
            line.x1 -
            line.x0
        ) /
        scale;


    const height =
        (
            line.y1 -
            line.y0
        ) /
        scale;


    if (
        width <= 2 ||
        height <= 2
    ) {

        return;
    }


    /*
     * Background color.
     */

    const bg =
        pdfGetBackgroundColor(
            canvas,
            line
        );


    const padding =
        Math.max(
            1,
            height * 0.10
        );


    /*
     * Cover original text.
     */

    pdf.setFillColor(

        bg.r,
        bg.g,
        bg.b

    );


    const coverX =
        Math.max(
            0,
            x - padding
        );


    const coverY =
        Math.max(
            0,
            y - padding
        );


    const coverWidth =
        Math.min(

            width +
            padding * 2,

            pageWidth -
            coverX

        );


    const coverHeight =
        Math.min(

            height +
            padding * 2,

            pageHeight -
            coverY

        );


    pdf.rect(

        coverX,

        coverY,

        coverWidth,

        coverHeight,

        "F"

    );


    /*
     * IMPORTANT:
     * Use Unicode Indian-language font.
     *
     * DO NOT use Helvetica here.
     */

    pdf.setFont(
        fontInfo.fontName,
        "normal"
    );


    /*
     * Calculate font size.
     */

    let fontSize =
        Math.max(
            6,
            Math.min(
                24,
                height * 0.78
            )
        );


    const originalLength =
        Math.max(
            1,
            String(
                line.text || ""
            ).length
        );


    const translatedLength =
        Math.max(
            1,
            String(
                translated
            ).length
        );


    const ratio =
        translatedLength /
        originalLength;


    if (
        ratio > 1.5
    ) {

        fontSize *=
            0.88;
    }


    if (
        ratio > 2.0
    ) {

        fontSize *=
            0.82;
    }


    if (
        ratio > 3.0
    ) {

        fontSize *=
            0.75;
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


    /*
     * Available width.
     */

    const availableWidth =
        Math.max(
            10,
            width -
            padding * 2
        );


    let wrapped;


    try {

        wrapped =
            pdf.splitTextToSize(

                String(
                    translated
                ),

                availableWidth

            );

    } catch (
        error
    ) {

        console.warn(
            "PDF text wrapping failed:",
            error
        );


        wrapped = [
            String(
                translated
            )
        ];
    }


    if (
        !Array.isArray(
            wrapped
        )
    ) {

        wrapped = [
            String(
                wrapped
            )
        ];
    }


    /*
     * Limit lines to the original
     * OCR line area.
     */

    const lineHeight =
        fontSize * 1.12;


    const maxLines =
        Math.max(

            1,

            Math.floor(

                (
                    height +
                    fontSize * 0.35
                ) /
                lineHeight

            )

        );


    wrapped =
        wrapped.slice(
            0,
            maxLines
        );


    /*
     * Position.
     */

    const textX =
        x + padding;


    let textY =
        y +
        Math.max(
            fontSize,
            height * 0.80
        );


    /*
     * Draw each wrapped line.
     */

    for (
        const textLine
        of wrapped
    ) {

        if (
            textLine &&
            String(
                textLine
            ).trim()
        ) {

            pdf.text(

                String(
                    textLine
                ),

                textX,

                textY,

                {

                    baseline:
                        "alphabetic"

                }

            );
        }


        textY +=
            lineHeight;


        /*
         * Do not draw outside
         * the page.
         */

        if (
            textY >
            pageHeight
        ) {

            break;
        }
    }
}


/* =========================================================
   PROCESS PDF
   ========================================================= */

async function pdfProcessFile(
    file
) {

    pdfClearError();

    pdfHideProgress();


    if (!file) {

        return;
    }


    try {

        /*
         * Libraries.
         */

        pdfCheckLibraries();


        /*
         * File check.
         */

        if (
            file.type !==
                "application/pdf" &&
            !file.name
                .toLowerCase()
                .endsWith(
                    ".pdf"
                )
        ) {

            throw new Error(
                "Please select a PDF file."
            );
        }


        /*
         * Target language.
         */

        const fontInfo =
            pdfGetPDFLanguageConfig();


        if (!fontInfo) {

            const message =
                "Translation not available for this language. Please try Hindi, Gujarati or Marathi.";


            pdfShowError(
                message
            );


            pdfSetTranslationStatus(
                message
            );


            return;
        }


        const sourceLanguage =
            pdfGetSourceLanguage();


        const targetLanguage =
            pdfGetTargetLanguage();


        const ocrLanguage =
            pdfGetOCRLanguage();


        console.log(
            "===================================="
        );


        console.log(
            "PDF PROCESSING"
        );


        console.log(
            "Source:",
            sourceLanguage
        );


        console.log(
            "Target:",
            targetLanguage
        );


        console.log(
            "OCR:",
            ocrLanguage
        );


        console.log(
            "Font:",
            fontInfo.fontFile
        );


        console.log(
            "===================================="
        );


        /*
         * Load Unicode font BEFORE
         * creating the PDF.
         */

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


        /*
         * Load PDF.
         */

        const pdf =
            await pdfLoadDocument(
                file
            );


        const totalPages =
            pdf.numPages;


        if (
            totalPages < 1
        ) {

            throw new Error(
                "PDF contains no pages."
            );
        }


        /*
         * Get first page.
         */

        const firstPage =
            await pdf.getPage(
                1
            );


        const firstViewport =
            firstPage.getViewport({

                scale:
                    1
            });


        const firstPageWidth =
            firstViewport.width;


        const firstPageHeight =
            firstViewport.height;


        /*
         * Create output PDF.
         */

        const outputPdf =
            pdfCreateOutputDocument(

                firstPageWidth,

                firstPageHeight,

                fontInfo,

                fontBase64

            );


        /*
         * Create ONE OCR worker.
         */

        pdfSetStatus(
            `🔎 Loading OCR language (${ocrLanguage})...`
        );


        const worker =
            await pdfCreateOCRWorker();


        try {

            /*
             * Process every page.
             */

            for (
                let pageNumber = 1;
                pageNumber <=
                totalPages;
                pageNumber++
            ) {

                console.log(
                    "===================================="
                );


                console.log(
                    `PAGE ${pageNumber}/${totalPages}`
                );


                console.log(
                    "===================================="
                );


                /*
                 * Page.
                 */

                const page =
                    pageNumber === 1
                        ? firstPage
                        : await pdf.getPage(
                            pageNumber
                        );


                /*
                 * Normal PDF page size.
                 */

                const pageViewport =
                    page.getViewport({

                        scale:
                            1
                    });


                const pageWidth =
                    pageViewport.width;


                const pageHeight =
                    pageViewport.height;


                /*
                 * Add page.
                 */

                if (
                    pageNumber > 1
                ) {

                    outputPdf.addPage(

                        [
                            pageWidth,
                            pageHeight
                        ],

                        pageWidth >
                        pageHeight
                            ? "landscape"
                            : "portrait"

                    );


                    /*
                     * Re-select Unicode font
                     * after adding page.
                     */

                    outputPdf.setFont(
                        fontInfo.fontName,
                        "normal"
                    );
                }


                /*
                 * Render page.
                 */

                pdfSetStatus(

                    `🖼️ Rendering page ${pageNumber} of ${totalPages}...`

                );


                const rendered =
                    await pdfRenderPage(
                        page
                    );


                const canvas =
                    rendered.canvas;


                /*
                 * Add original page image.
                 */

                const imageData =
                    canvas.toDataURL(

                        "image/jpeg",

                        PDF_JPEG_QUALITY

                    );


                outputPdf.addImage(

                    imageData,

                    "JPEG",

                    0,

                    0,

                    pageWidth,

                    pageHeight,

                    undefined,

                    "FAST"

                );


                /*
                 * OCR.
                 */

                const ocrData =
                    await pdfOCRPage(

                        worker,

                        canvas,

                        pageNumber,

                        totalPages

                    );


                const lines =
                    pdfGetOCRLines(
                        ocrData
                    );


                console.log(

                    `OCR lines found on page ${pageNumber}:`,

                    lines.length

                );


                if (
                    lines.length ===
                    0
                ) {

                    console.warn(
                        "No OCR lines found on page:",
                        pageNumber
                    );


                    pdfSetProgress(

                        Math.round(
                            (
                                pageNumber /
                                totalPages
                            ) * 95
                        )

                    );


                    continue;
                }


                /*
                 * Translate each line.
                 */

                const translatedLines =
                    [];


                for (
                    let i = 0;
                    i < lines.length;
                    i++
                ) {

                    const line =
                        lines[i];


                    pdfSetStatus(

                        `🌎 Translating page ${pageNumber}/${totalPages} — ${i + 1}/${lines.length}`

                    );


                    pdfSetTranslationStatus(

                        `Translating ${i + 1}/${lines.length}...`

                    );


                    let translated = "";


                    try {

                        translated =
                            await pdfTranslateText(
                                line.text
                            );


                        console.log(
                            "Translated:",
                            line.text,
                            "=>",
                            translated
                        );


                    } catch (
                        translationError
                    ) {

                        console.error(

                            "Translation failed for line:",

                            line.text,

                            translationError

                        );


                        /*
                         * Keep OCR text if
                         * individual translation
                         * fails.
                         */

                        translated =
                            line.text;
                    }


                    translatedLines.push({

                        ...line,

                        translated:
                            translated

                    });


                    /*
                     * Progress.
                     */

                    const pageProgress =
                        (
                            (
                                i + 1
                            ) /
                            Math.max(
                                1,
                                lines.length
                            )
                        );


                    const overallProgress =
                        (
                            (
                                pageNumber -
                                1
                            ) /
                            totalPages
                        ) *
                        100
                        +
                        (
                            pageProgress /
                            totalPages
                        ) *
                        85;


                    pdfSetProgress(

                        Math.min(
                            95,
                            Math.max(
                                10,
                                overallProgress
                            )
                        )

                    );


                    /*
                     * Let browser update UI.
                     */

                    await new Promise(

                        function(resolve) {

                            setTimeout(
                                resolve,
                                5
                            );

                        }

                    );
                }


                /*
                 * Draw translations.
                 */

                pdfSetStatus(

                    `✏️ Applying translation to page ${pageNumber}...`

                );


                pdfSetTranslationStatus(

                    `Applying translation to page ${pageNumber}...`

                );


                for (
                    const item
                    of translatedLines
                ) {

                    pdfDrawTranslatedText(

                        outputPdf,

                        canvas,

                        item,

                        item.translated,

                        pageWidth,

                        pageHeight,

                        fontInfo

                    );
                }


                pdfSetProgress(

                    Math.round(
                        (
                            pageNumber /
                            totalPages
                        ) * 95
                    )

                );
            }


        } finally {

            /*
             * Always terminate OCR worker.
             */

            try {

                await worker.terminate();

                console.log(
                    "Tesseract worker terminated."
                );

            } catch (
                terminateError
            ) {

                console.warn(

                    "Could not terminate Tesseract worker:",

                    terminateError

                );
            }
        }


        /*
         * Metadata.
         */

        try {

            outputPdf.setProperties({

                title:
                    "Translated - " +
                    file.name,

                subject:
                    "OCR translated PDF",

                author:
                    "Dhiren Translate",

                creator:
                    "Dhiren Translate"

            });

        } catch (
            metadataError
        ) {

            console.warn(
                "PDF metadata error:",
                metadataError
            );
        }


        /*
         * Filename.
         */

        const baseName =
            file.name.replace(

                /\.pdf$/i,

                ""

            );


        const safeBaseName =
            baseName.replace(

                /[^a-zA-Z0-9_-]+/g,

                "_"

            );


        const outputName =
            "translated_" +
            safeBaseName +
            ".pdf";


        /*
         * Save.
         */

        pdfSetStatus(
            "💾 Creating translated PDF..."
        );


        pdfSetTranslationStatus(
            "Saving translated PDF..."
        );


        pdfSetProgress(
            98
        );


        outputPdf.save(
            outputName
        );


        pdfSetProgress(
            100
        );


        pdfSetStatus(

            `✅ Complete! Downloaded ${outputName}`

        );


        pdfSetTranslationStatus(
            "✅ PDF translation completed."
        );


        console.log(
            "===================================="
        );


        console.log(
            "PDF PROCESSING COMPLETED"
        );


        console.log(
            "Output:",
            outputName
        );


        console.log(
            "===================================="
        );


        setTimeout(

            function() {

                pdfHideProgress();

            },

            2000

        );


    } catch (
        error
    ) {

        console.error(
            "===================================="
        );


        console.error(
            "PDF PROCESSING ERROR"
        );


        console.error(
            error
        );


        console.error(
            "===================================="
        );


        const message =
            error &&
            error.message
                ? error.message
                : String(error);


        pdfShowError(
            message
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

if (
    pdfInput
) {

    console.log(
        "PDF input found."
    );


    pdfInput.addEventListener(

        "change",

        async function(event) {

            console.log(
                "===================================="
            );


            console.log(
                "PDF FILE CHANGE EVENT FIRED"
            );


            console.log(
                "===================================="
            );


            pdfClearError();


            const file =
                event.target.files &&
                event.target.files[0];


            if (!file) {

                console.warn(
                    "No PDF selected."
                );

                return;
            }


            console.log(
                "File:",
                file.name
            );


            console.log(
                "Type:",
                file.type
            );


            console.log(
                "Size:",
                file.size
            );


            pdfSetStatus(

                `📥 PDF selected: ${file.name}`

            );


            try {

                await pdfProcessFile(
                    file
                );

            } catch (
                error
            ) {

                console.error(
                    "Unhandled PDF error:",
                    error
                );


                pdfShowError(

                    error &&
                    error.message
                        ? error.message
                        : "Unknown PDF processing error."

                );

            } finally {

                /*
                 * Allow selecting the
                 * same PDF again.
                 */

                event.target.value =
                    "";
            }

        }
    );


} else {

    console.error(
        "CRITICAL ERROR: #pdfInput NOT FOUND."
    );
}


/* =========================================================
   INITIALIZATION
   ========================================================= */

pdfInitializePDFJS();


/* =========================================================
   FINAL DIAGNOSTICS
   ========================================================= */

console.log(
    "PDF input:",
    pdfInput
);


console.log(
    "PDF.js:",
    typeof window.pdfjsLib !==
        "undefined"
        ? "READY"
        : "MISSING"
);


console.log(
    "Tesseract:",
    typeof window.Tesseract !==
        "undefined"
        ? "READY"
        : "MISSING"
);


console.log(
    "jsPDF:",
    typeof window.jspdf !==
        "undefined" &&
    typeof window.jspdf.jsPDF ===
        "function"
        ? "READY"
        : "MISSING"
);


console.log(
    "Dhiren Translate PDF module ready."
);


console.log(
    "===================================="
);
