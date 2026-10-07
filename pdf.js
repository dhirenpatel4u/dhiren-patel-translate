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

 VERSION:
    Word-level OCR positioning
    Safer background replacement
    Better spacing
    Better font sizing
    Reduced overlap
    Failed translation keeps original text
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
    document.getElementById("ocrProgressContainer");

const pdfProgress =
    document.getElementById("ocrProgress");

const pdfError =
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


/*
 * Small cover padding.
 *
 * IMPORTANT:
 * Keep this very small.
 * Large padding creates white strips.
 */
const PDF_COVER_PADDING = 0.8;


/*
 * Minimum confidence accepted for OCR words.
 */
const PDF_MIN_OCR_CONFIDENCE = 20;


/*
 * Minimum font size.
 */
const PDF_MIN_FONT_SIZE = 5;


/*
 * Maximum font size.
 */
const PDF_MAX_FONT_SIZE = 28;


/* =========================================================
   PDF TRANSLATION LANGUAGES
   ========================================================= */

const PDF_SUPPORTED_LANGUAGES = {

    hi: {

        name:
            "Hindi",

        fontFile:
            "/fonts/NotoSansDevanagari-Regular.ttf",

        fontName:
            "NotoSansDevanagari"
    },

    mr: {

        name:
            "Marathi",

        fontFile:
            "/fonts/NotoSansDevanagari-Regular.ttf",

        fontName:
            "NotoSansDevanagari"
    },

    gu: {

        name:
            "Gujarati",

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

            pdfProgress.value =
                0;
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
            "❌ " +
            String(message);

        pdfError.classList.remove(
            "hidden"
        );
    }

    pdfSetStatus(
        "❌ " +
        String(message)
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

function pdfNormalizeLanguage(
    language
) {

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
                method:
                    "GET",

                cache:
                    "force-cache"
            }
        );


    if (
        !response.ok
    ) {

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


    let binary =
        "";


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
        btoa(
            binary
        );


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
        await window.Tesseract
            .createWorker(
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
                                        ) *
                                        100
                                    ) +
                                    "%"
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
                                        ) *
                                        100
                                    ) +
                                    "%"
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
   GET OCR WORDS
   ========================================================= */

/*
 * This is the major improvement.
 *
 * Instead of relying only on:
 *
 *     data.lines
 *
 * we use:
 *
 *     data.words
 *
 * Each word has its own bounding box.
 *
 * This gives us much better control over:
 *
 *     X position
 *     Y position
 *     word spacing
 *     font size
 *     overlap
 */
function pdfGetOCRWords(
    data
) {

    if (
        !data ||
        !Array.isArray(
            data.words
        )
    ) {

        return [];
    }


    return data.words

        .filter(
            function(word) {

                if (
                    !word ||
                    !word.bbox
                ) {

                    return false;
                }


                const text =
                    String(
                        word.text ||
                        ""
                    );


                if (
                    !text.trim()
                ) {

                    return false;
                }


                const confidence =
                    Number(
                        word.confidence
                    );


                if (
                    Number.isFinite(
                        confidence
                    ) &&
                    confidence <
                        PDF_MIN_OCR_CONFIDENCE
                ) {

                    return false;
                }


                return true;
            }
        )

        .map(
            function(word) {

                return {

                    text:
                        String(
                            word.text ||
                            ""
                        ),

                    confidence:
                        Number(
                            word.confidence ||
                            0
                        ),

                    x0:
                        Number(
                            word.bbox.x0 ||
                            0
                        ),

                    y0:
                        Number(
                            word.bbox.y0 ||
                            0
                        ),

                    x1:
                        Number(
                            word.bbox.x1 ||
                            0
                        ),

                    y1:
                        Number(
                            word.bbox.y1 ||
                            0
                        )
                };
            }
        )

        .filter(
            function(word) {

                return (
                    word.x1 >
                        word.x0 &&

                    word.y1 >
                        word.y0
                );
            }
        );
}


/* =========================================================
   GET OCR LINES
   ========================================================= */

/*
 * We still keep line information for translation.
 *
 * But word coordinates are preserved inside every line.
 */
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

                /*
                 * IMPORTANT:
                 *
                 * Do NOT collapse spaces.
                 */
                const text =
                    String(
                        line.text
                    )
                    .replace(
                        /^[\t ]+/,
                        ""
                    )
                    .replace(
                        /[\t ]+$/,
                        ""
                    );


                return {

                    text:
                        text,

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


    if (!translated) {

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


                if (itemText) {

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
   BACKGROUND COLOR
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

            i < image.data.length;

            i += 4
        ) {

            const rr =
                image.data[i];

            const gg =
                image.data[
                    i + 1
                ];

            const bb =
                image.data[
                    i + 2
                ];


            /*
             * Only bright pixels are used to
             * estimate background.
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
   DETECT BOLD
   ========================================================= */

function pdfDetectBold(
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

            return false;
        }


        const sx =
            Math.max(
                0,
                Math.floor(
                    line.x0
                )
            );


        const sy =
            Math.max(
                0,
                Math.floor(
                    line.y0
                )
            );


        const sw =
            Math.min(

                Math.max(
                    2,
                    Math.floor(
                        line.x1 -
                        line.x0
                    )
                ),

                canvas.width -
                    sx
            );


        const sh =
            Math.min(

                Math.max(
                    2,
                    Math.floor(
                        line.y1 -
                        line.y0
                    )
                ),

                canvas.height -
                    sy
            );


        if (
            sw <= 1 ||
            sh <= 1
        ) {

            return false;
        }


        const pixels =
            ctx.getImageData(
                sx,
                sy,
                sw,
                sh
            ).data;


        let darkPixels =
            0;


        let totalPixels =
            0;


        for (
            let i = 0;

            i < pixels.length;

            i += 4
        ) {

            const r =
                pixels[i];

            const g =
                pixels[
                    i + 1
                ];

            const b =
                pixels[
                    i + 2
                ];


            if (
                r < 130 &&
                g < 130 &&
                b < 130
            ) {

                darkPixels++;
            }


            totalPixels++;
        }


        const darkness =
            darkPixels /
            Math.max(
                1,
                totalPixels
            );


        return (
            darkness >
            0.16
        );

    } catch (
        error
    ) {

        console.warn(
            "Bold detection failed:",
            error
        );


        return false;
    }
}


/* =========================================================
   FIND SAFE BACKGROUND
   ========================================================= */

/*
 * Instead of always painting a pure white box,
 * sample the original page.
 *
 * This prevents visible white strips on colored
 * or slightly grey document backgrounds.
 */
function pdfSetSampledFill(
    pdf,
    canvas,
    line
) {

    const bg =
        pdfGetBackgroundColor(
            canvas,
            line
        );


    pdf.setFillColor(
        bg.r,
        bg.g,
        bg.b
    );
}


/* =========================================================
   GET LINE WORDS
   ========================================================= */

function pdfGetWordsForLine(
    words,
    line
) {

    if (
        !Array.isArray(words)
    ) {

        return [];
    }


    const lineCenterY =
        (
            line.y0 +
            line.y1
        ) / 2;


    const lineHeight =
        Math.max(
            1,
            line.y1 -
            line.y0
        );


    return words

        .filter(
            function(word) {

                const wordCenterY =
                    (
                        word.y0 +
                        word.y1
                    ) / 2;


                /*
                 * Word must vertically belong
                 * to this OCR line.
                 */
                const verticalDistance =
                    Math.abs(
                        wordCenterY -
                        lineCenterY
                    );


                if (
                    verticalDistance >
                    lineHeight *
                    0.75
                ) {

                    return false;
                }


                /*
                 * Word must overlap line horizontally.
                 */
                if (
                    word.x1 <
                        line.x0 ||

                    word.x0 >
                        line.x1
                ) {

                    return false;
                }


                return true;
            }
        )

        .sort(
            function(a, b) {

                return (
                    a.x0 -
                    b.x0
                );
            }
        );
}


/* =========================================================
   CALCULATE WORD SPACING
   ========================================================= */

/*
 * Determine how much empty space existed between
 * OCR words.
 *
 * This is used as a visual guide when positioning
 * translated content.
 */
function pdfCalculateWordGaps(
    words
) {

    const gaps = [];


    for (
        let i = 1;

        i < words.length;

        i++
    ) {

        const previous =
            words[
                i - 1
            ];

        const current =
            words[i];


        const gap =
            current.x0 -
            previous.x1;


        gaps.push(
            Math.max(
                0,
                gap
            )
        );
    }


    return gaps;
}


/* =========================================================
   SPLIT TRANSLATION INTO WORDS
   ========================================================= */

function pdfSplitTranslationWords(
    translated
) {

    /*
     * Keep multiple spaces.
     *
     * We don't use split(" ") because that loses
     * information about repeated spaces.
     */
    const matches =
        String(
            translated || ""
        )
        .match(
            /\S+|\s+/g
        );


    if (!matches) {

        return [];
    }


    return matches;
}


/* =========================================================
   DRAW TRANSLATED WORD
   ========================================================= */

/*
 * Draw one translated word into an allocated
 * horizontal region.
 */
function pdfDrawWord(
    pdf,
    word,
    x,
    y,
    width,
    height,
    fontInfo,
    bold
) {

    const text =
        String(
            word || ""
        );


    if (
        !text.trim()
    ) {

        return;
    }


    const safeWidth =
        Math.max(
            2,
            width
        );


    const safeHeight =
        Math.max(
            4,
            height
        );


    let fontSize =
        Math.max(
            PDF_MIN_FONT_SIZE,
            Math.min(
                PDF_MAX_FONT_SIZE,
                safeHeight *
                    0.82
            )
        );


    pdf.setFont(
        fontInfo.fontName,
        "normal"
    );


    /*
     * Reduce font size until the word fits.
     */
    while (
        fontSize >
            PDF_MIN_FONT_SIZE
    ) {

        pdf.setFontSize(
            fontSize
        );


        let measured =
            0;


        try {

            measured =
                pdf.getTextWidth(
                    text
                );

        } catch (
            error
        ) {

            measured =
                text.length *
                fontSize *
                0.50;
        }


        if (
            measured <=
            safeWidth
        ) {

            break;
        }


        fontSize -=
            0.20;
    }


    pdf.setFontSize(
        fontSize
    );


    let measuredWidth =
        0;


    try {

        measuredWidth =
            pdf.getTextWidth(
                text
            );

    } catch (
        error
    ) {

        measuredWidth =
            text.length *
            fontSize *
            0.50;
    }


    /*
     * Last safety reduction.
     */
    if (
        measuredWidth >
        safeWidth
    ) {

        const ratio =
            safeWidth /
            Math.max(
                1,
                measuredWidth
            );


        fontSize =
            Math.max(
                PDF_MIN_FONT_SIZE,
                fontSize *
                    ratio
            );


        pdf.setFontSize(
            fontSize
        );
    }


    /*
     * Vertically center.
     */
    const textY =
        y +
        (
            safeHeight -
            fontSize
        ) / 2 +
        fontSize *
            0.82;


    pdf.setTextColor(
        0,
        0,
        0
    );


    /*
     * Normal text.
     */
    pdf.text(
        text,
        x,
        textY,
        {
            baseline:
                "alphabetic"
        }
    );


    /*
     * Approximate bold.
     */
    if (bold) {

        const offset =
            Math.max(
                0.08,
                Math.min(
                    0.25,
                    fontSize *
                        0.014
                )
            );


        pdf.text(
            text,
            x +
                offset,
            textY,
            {
                baseline:
                    "alphabetic"
            }
        );
    }
}


/* =========================================================
   DRAW TRANSLATED LINE
   ========================================================= */

/*
 * This version does NOT create a large white rectangle
 * around the whole line.
 *
 * Instead:
 *
 * 1. Determine the original OCR word positions.
 * 2. Determine the translated words.
 * 3. Give translated words their own areas.
 * 4. Only cover the actual original text region.
 *
 * This dramatically reduces white strips and overlap.
 */
function pdfDrawTranslatedText(
    pdf,
    canvas,
    line,
    translated,
    pageWidth,
    pageHeight,
    fontInfo,
    lineWords
) {

    if (
        !translated ||
        !String(
            translated
        ).trim()
    ) {

        return false;
    }


    const scale =
        PDF_RENDER_SCALE;


    /*
     * Original line position.
     */
    const x0 =
        Number(
            line.x0 || 0
        );


    const y0 =
        Number(
            line.y0 || 0
        );


    const x1 =
        Number(
            line.x1 || 0
        );


    const y1 =
        Number(
            line.y1 || 0
        );


    if (
        x1 <= x0 ||
        y1 <= y0
    ) {

        return false;
    }


    /*
     * Convert to PDF points.
     */
    const pdfX =
        x0 / scale;


    const pdfY =
        y0 / scale;


    const pdfWidth =
        (
            x1 -
            x0
        ) / scale;


    const pdfHeight =
        (
            y1 -
            y0
        ) / scale;


    if (
        pdfWidth <= 2 ||
        pdfHeight <= 2
    ) {

        return false;
    }


    /*
     * Translation.
     */
    const translatedText =
        String(
            translated
        ).trim();


    if (!translatedText) {

        return false;
    }


    /*
     * Detect bold from original line.
     */
    const isBold =
        pdfDetectBold(
            canvas,
            line
        );


    /*
     * -----------------------------------------------------
     * IMPORTANT SAFETY:
     *
     * If OCR has no word positions, use the old
     * line-level fallback.
     * -----------------------------------------------------
     */
    if (
        !Array.isArray(
            lineWords
        ) ||
        lineWords.length === 0
    ) {

        return pdfDrawTranslatedLineFallback(
            pdf,
            canvas,
            line,
            translatedText,
            pageWidth,
            pageHeight,
            fontInfo,
            isBold
        );
    }


    /*
     * Original word coordinates.
     */
    const originalWords =
        lineWords
            .filter(
                function(word) {

                    return (
                        word &&
                        word.text &&
                        word.x1 >
                            word.x0
                    );
                }
            )
            .sort(
                function(a, b) {

                    return (
                        a.x0 -
                        b.x0
                    );
                }
            );


    if (
        originalWords.length === 0
    ) {

        return pdfDrawTranslatedLineFallback(
            pdf,
            canvas,
            line,
            translatedText,
            pageWidth,
            pageHeight,
            fontInfo,
            isBold
        );
    }


    /*
     * -----------------------------------------------------
     * BACKGROUND COVER
     * -----------------------------------------------------
     *
     * IMPORTANT:
     * Cover only the actual line.
     *
     * Do NOT expand to neighbouring OCR lines.
     */
    const padding =
        PDF_COVER_PADDING;


    const coverX =
        Math.max(
            0,
            pdfX -
                padding
        );


    const coverY =
        Math.max(
            0,
            pdfY -
                padding
        );


    const coverWidth =
        Math.min(
            pdfWidth +
                padding * 2,

            pageWidth -
                coverX
        );


    const coverHeight =
        Math.min(
            pdfHeight +
                padding * 2,

            pageHeight -
                coverY
        );


    /*
     * Sample original background.
     */
    pdfSetSampledFill(
        pdf,
        canvas,
        line
    );


    pdf.rect(
        coverX,
        coverY,
        coverWidth,
        coverHeight,
        "F"
    );


    /*
     * -----------------------------------------------------
     * TRANSLATED WORDS
     * -----------------------------------------------------
     */

    const translatedTokens =
        pdfSplitTranslationWords(
            translatedText
        );


    /*
     * If translation has only one token, draw it
     * across the complete original line.
     */
    const nonSpaceTokens =
        translatedTokens.filter(
            function(token) {

                return (
                    /\S/.test(
                        token
                    )
                );
            }
        );


    if (
        nonSpaceTokens.length === 0
    ) {

        return false;
    }


    /*
     * -----------------------------------------------------
     * WORD-LEVEL LAYOUT
     * -----------------------------------------------------
     *
     * We use the original word widths as a proportional
     * reference.
     */
    const originalWordWidths =
        originalWords.map(
            function(word) {

                return Math.max(
                    1,
                    (
                        word.x1 -
                        word.x0
                    )
                );
            }
        );


    let totalOriginalWidth =
        originalWordWidths.reduce(
            function(sum, value) {

                return (
                    sum +
                    value
                );
            },
            0
        );


    /*
     * Add original gaps.
     */
    const originalGaps =
        pdfCalculateWordGaps(
            originalWords
        );


    const totalOriginalGaps =
        originalGaps.reduce(
            function(sum, value) {

                return (
                    sum +
                    value
                );
            },
            0
        );


    totalOriginalWidth +=
        totalOriginalGaps;


    /*
     * If there are more translated words than original
     * words, distribute the complete line width.
     */
    const targetWordCount =
        nonSpaceTokens.length;


    const allocatedWidths =
        [];


    if (
        targetWordCount <=
        originalWords.length
    ) {

        /*
         * Use original word proportions.
         */
        const proportions =
            originalWordWidths
                .slice(
                    0,
                    targetWordCount
                );


        const proportionTotal =
            proportions.reduce(
                function(sum, value) {

                    return (
                        sum +
                        value
                    );
                },
                0
            );


        for (
            let i = 0;

            i <
            targetWordCount;

            i++
        ) {

            allocatedWidths.push(

                pdfWidth *
                (
                    proportions[i] /
                    Math.max(
                        1,
                        proportionTotal
                    )
                )
            );
        }

    } else {

        /*
         * More translated words than original words.
         *
         * Divide based on translated word lengths,
         * while still keeping everything inside the
         * original OCR line.
         */
        const translatedLengths =
            nonSpaceTokens.map(
                function(token) {

                    return Math.max(
                        1,
                        token.length
                    );
                }
            );


        const totalTranslatedLength =
            translatedLengths.reduce(
                function(sum, value) {

                    return (
                        sum +
                        value
                    );
                },
                0
            );


        for (
            let i = 0;

            i <
            targetWordCount;

            i++
        ) {

            allocatedWidths.push(

                pdfWidth *
                (
                    translatedLengths[i] /
                    Math.max(
                        1,
                        totalTranslatedLength
                    )
                )
            );
        }
    }


    /*
     * -----------------------------------------------------
     * DRAW TRANSLATED WORDS
     * -----------------------------------------------------
     */

    let currentX =
        coverX;


    let wordIndex =
        0;


    for (
        const token of translatedTokens
    ) {

        /*
         * Space token.
         */
        if (
            !/\S/.test(
                token
            )
        ) {

            /*
             * Preserve a proportional visual gap.
             *
             * We don't simply throw the spaces away.
             */
            const averageSpace =
                Math.max(
                    1,
                    pdfHeight *
                    0.22
                );


            currentX +=
                averageSpace *
                Math.max(
                    1,
                    token.length
                );


            continue;
        }


        if (
            wordIndex >=
            allocatedWidths.length
        ) {

            break;
        }


        const wordWidth =
            allocatedWidths[
                wordIndex
            ];


        /*
         * Prevent word from leaving line.
         */
        const safeWordWidth =
            Math.max(
                2,
                Math.min(
                    wordWidth,
                    coverX +
                        coverWidth -
                        currentX
                )
            );


        pdfDrawWord(

            pdf,

            token,

            currentX,

            coverY,

            safeWordWidth,

            coverHeight,

            fontInfo,

            isBold
        );


        currentX +=
            safeWordWidth;


        wordIndex++;
    }


    console.log(
        "[PDF WORD LAYOUT]",
        {

            original:
                line.text,

            translated:
                translatedText,

            words:
                originalWords.length,

            translatedWords:
                targetWordCount,

            font:
                fontInfo.fontName,

            bold:
                isBold
        }
    );


    return true;
}


/* =========================================================
   FALLBACK LINE DRAW
   ========================================================= */

function pdfDrawTranslatedLineFallback(
    pdf,
    canvas,
    line,
    translatedText,
    pageWidth,
    pageHeight,
    fontInfo,
    isBold
) {

    const scale =
        PDF_RENDER_SCALE;


    const x =
        Number(
            line.x0 || 0
        ) / scale;


    const y =
        Number(
            line.y0 || 0
        ) / scale;


    const width =
        Math.max(
            4,
            (
                Number(
                    line.x1 || 0
                ) -
                Number(
                    line.x0 || 0
                )
            )
        ) / scale;


    const height =
        Math.max(
            4,
            (
                Number(
                    line.y1 || 0
                ) -
                Number(
                    line.y0 || 0
                )
            )
        ) / scale;


    if (
        width <= 2 ||
        height <= 2
    ) {

        return false;
    }


    const padding =
        Math.min(
            1.5,
            Math.max(
                0.5,
                height *
                0.05
            )
        );


    const boxX =
        Math.max(
            0,
            x -
                padding
        );


    const boxY =
        Math.max(
            0,
            y -
                padding
        );


    const boxWidth =
        Math.min(
            width +
                padding * 2,
            pageWidth -
                boxX
        );


    const boxHeight =
        Math.min(
            height +
                padding * 2,
            pageHeight -
                boxY
        );


    /*
     * Sampled background.
     */
    pdfSetSampledFill(
        pdf,
        canvas,
        line
    );


    pdf.rect(
        boxX,
        boxY,
        boxWidth,
        boxHeight,
        "F"
    );


    pdf.setFont(
        fontInfo.fontName,
        "normal"
    );


    let fontSize =
        Math.max(
            PDF_MIN_FONT_SIZE,
            Math.min(
                PDF_MAX_FONT_SIZE,
                height *
                    0.82
            )
        );


    const availableWidth =
        Math.max(
            5,
            boxWidth -
                padding * 2
        );


    /*
     * Fit complete translation.
     */
    while (
        fontSize >
            PDF_MIN_FONT_SIZE
    ) {

        pdf.setFontSize(
            fontSize
        );


        let measured =
            0;


        try {

            measured =
                pdf.getTextWidth(
                    translatedText
                );

        } catch (
            error
        ) {

            measured =
                translatedText.length *
                fontSize *
                0.50;
        }


        if (
            measured <=
            availableWidth
        ) {

            break;
        }


        fontSize -=
            0.20;
    }


    pdf.setFontSize(
        fontSize
    );


    const textY =
        boxY +
        (
            boxHeight -
            fontSize
        ) / 2 +
        fontSize *
            0.82;


    pdf.setTextColor(
        0,
        0,
        0
    );


    pdf.text(
        translatedText,
        boxX +
            padding,
        Math.min(
            pageHeight - 1,
            textY
        ),
        {
            baseline:
                "alphabetic"
        }
    );


    if (
        isBold
    ) {

        const offset =
            Math.max(
                0.08,
                Math.min(
                    0.25,
                    fontSize *
                        0.014
                )
            );


        pdf.text(
            translatedText,
            boxX +
                padding +
                offset,
            Math.min(
                pageHeight - 1,
                textY
            ),
            {
                baseline:
                    "alphabetic"
            }
        );
    }


    return true;
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

        pdfCheckLibraries();


        /* =================================================
           CHECK FILE
           ================================================= */

        if (
            file.type !==
                "application/pdf" &&

            !file.name
                .toLowerCase()
                .endsWith(".pdf")
        ) {

            throw new Error(
                "Please select a PDF file."
            );
        }


        /* =================================================
           CHECK TARGET LANGUAGE
           ================================================= */

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


        /* =================================================
           LANGUAGES
           ================================================= */

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


        /* =================================================
           LOAD FONT
           ================================================= */

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


        /* =================================================
           LOAD PDF
           ================================================= */

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


        /* =================================================
           FIRST PAGE
           ================================================= */

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


        /* =================================================
           OUTPUT PDF
           ================================================= */

        const outputPdf =
            pdfCreateOutputDocument(
                firstPageWidth,
                firstPageHeight,
                fontInfo,
                fontBase64
            );


        /* =================================================
           OCR WORKER
           ================================================= */

        pdfSetStatus(
            `🔎 Loading OCR language (${ocrLanguage})...`
        );


        const worker =
            await pdfCreateOCRWorker();


        try {

            /* =============================================
               PROCESS PAGES
               ============================================= */

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


                /* =========================================
                   GET PAGE
                   ========================================= */

                const page =
                    pageNumber === 1

                        ? firstPage

                        : await pdf.getPage(
                            pageNumber
                        );


                const pageViewport =
                    page.getViewport({
                        scale:
                            1
                    });


                const pageWidth =
                    pageViewport.width;


                const pageHeight =
                    pageViewport.height;


                /* =========================================
                   ADD OUTPUT PAGE
                   ========================================= */

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


                    outputPdf.setFont(
                        fontInfo.fontName,
                        "normal"
                    );
                }


                /* =========================================
                   RENDER
                   ========================================= */

                pdfSetStatus(
                    `🖼️ Rendering page ${pageNumber} of ${totalPages}...`
                );


                const rendered =
                    await pdfRenderPage(
                        page
                    );


                const canvas =
                    rendered.canvas;


                /* =========================================
                   PAGE IMAGE
                   ========================================= */

                const imageData =
                    canvas.toDataURL(
                        "image/jpeg",
                        PDF_JPEG_QUALITY
                    );


                /*
                 * Original page remains the complete
                 * background.
                 */
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


                /* =========================================
                   OCR
                   ========================================= */

                const ocrData =
                    await pdfOCRPage(

                        worker,

                        canvas,

                        pageNumber,

                        totalPages
                    );


                /* =========================================
                   GET WORDS
                   ========================================= */

                const words =
                    pdfGetOCRWords(
                        ocrData
                    );


                console.log(
                    `OCR words found on page ${pageNumber}:`,
                    words.length
                );


                /* =========================================
                   GET LINES
                   ========================================= */

                const lines =
                    pdfGetOCRLines(
                        ocrData
                    );


                console.log(
                    `OCR lines found on page ${pageNumber}:`,
                    lines.length
                );


                if (
                    lines.length === 0
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
                            ) *
                            95
                        )
                    );


                    continue;
                }


                /* =========================================
                   TRANSLATED LINES
                   ========================================= */

                const translatedLines =
                    [];


                /* =========================================
                   TRANSLATE
                   ========================================= */

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


                    let translated =
                        "";


                    try {

                        translated =
                            await pdfTranslateText(
                                line.text
                            );


                        /*
                         * Make sure translation actually
                         * contains usable text.
                         */
                        if (
                            !translated ||
                            !String(
                                translated
                            ).trim()
                        ) {

                            throw new Error(
                                "Empty translation"
                            );
                        }


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
                            "Translation failed:",
                            line.text,
                            translationError
                        );


                        /*
                         * IMPORTANT:
                         *
                         * Do NOT draw anything over this line.
                         *
                         * The original page image underneath
                         * remains untouched.
                         *
                         * This eliminates the white strip
                         * problem when translation fails.
                         */
                        translated =
                            null;
                    }


                    translatedLines.push({

                        ...line,

                        translated:
                            translated
                    });


                    /* =====================================
                       PROGRESS
                       ===================================== */

                    const pageProgress =
                        (
                            (i + 1) /
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


                    await new Promise(
                        function(resolve) {

                            setTimeout(
                                resolve,
                                5
                            );
                        }
                    );
                }


                /* =========================================
                   APPLY TRANSLATION
                   ========================================= */

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

                    /*
                     * NEVER overwrite the original text
                     * if translation failed.
                     */
                    if (
                        !item.translated ||
                        !String(
                            item.translated
                        ).trim()
                    ) {

                        console.warn(
                            "Skipping untranslated line:",
                            item.text
                        );

                        continue;
                    }


                    /*
                     * Get words belonging to this line.
                     */
                    const lineWords =
                        pdfGetWordsForLine(
                            words,
                            item
                        );


                    try {

                        pdfDrawTranslatedText(

                            outputPdf,

                            canvas,

                            item,

                            item.translated,

                            pageWidth,

                            pageHeight,

                            fontInfo,

                            lineWords
                        );

                    } catch (
                        drawError
                    ) {

                        console.error(
                            "Could not draw translated line:",
                            item.text,
                            drawError
                        );

                        /*
                         * IMPORTANT:
                         *
                         * Do nothing else.
                         *
                         * The original page image remains
                         * visible underneath.
                         */
                    }
                }


                /* =========================================
                   PAGE COMPLETE
                   ========================================= */

                pdfSetProgress(
                    Math.round(
                        (
                            pageNumber /
                            totalPages
                        ) *
                        95
                    )
                );
            }

        } finally {

            /* =============================================
               TERMINATE OCR
               ============================================= */

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


        /* =================================================
           PDF METADATA
           ================================================= */

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


        /* =================================================
           OUTPUT NAME
           ================================================= */

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


        /* =================================================
           SAVE
           ================================================= */

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

                : String(
                    error
                );


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

if (pdfInput) {

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
