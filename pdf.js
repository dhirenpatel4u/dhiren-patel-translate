"use strict";


/*
 * =========================================================
 * DHIREN TRANSLATE
 * PDF OCR + TRANSLATION
 * =========================================================
 *
 * IMPORTANT:
 *
 * This file is completely independent from app.js.
 *
 * app.js:
 *     Image OCR
 *     Normal text translation
 *
 * pdf.js:
 *     PDF upload
 *     PDF rendering
 *     PDF OCR
 *     OCR coordinates
 *     Translation
 *     Translated PDF generation
 *
 * Existing API:
 *
 * /api/?sl=en&tl=hi&q=Hello
 *
 * =========================================================
 */


/*
 * =========================================================
 * CONFIGURATION
 * =========================================================
 */

const PDF_API_URL = "/api/";

const PDF_RENDER_SCALE = 2.0;

const PDF_OCR_MIN_CONFIDENCE = 35;

const PDF_MAX_PAGES = 100;

const PDF_TRANSLATION_DELAY = 20;


/*
 * =========================================================
 * DOM
 * =========================================================
 */

const pdfInput =
    document.getElementById(
        "pdfInput"
    );

const pdfSourceLanguage =
    document.getElementById(
        "sourceLanguage"
    );

const pdfTargetLanguage =
    document.getElementById(
        "targetLanguage"
    );

const pdfErrorMessage =
    document.getElementById(
        "errorMessage"
    );


/*
 * =========================================================
 * STATE
 * =========================================================
 */

let pdfProcessing =
    false;


/*
 * =========================================================
 * OCR LANGUAGE MAP
 * =========================================================
 */

const PDF_OCR_LANGUAGES = {

    "en": "eng",

    "hi": "hin",

    "gu": "guj",

    "mr": "mar",

    "bn": "ben",

    "ta": "tam",

    "te": "tel",

    "kn": "kan",

    "ml": "mal",

    "pa": "pan",

    "ur": "urd",

    "ne": "nep",

    "sa": "san",

    "ar": "ara",

    "fa": "fas",

    "de": "deu",

    "fr": "fra",

    "es": "spa",

    "it": "ita",

    "pt": "por",

    "ru": "rus",

    "ja": "jpn",

    "ko": "kor",

    "zh-CN": "chi_sim",

    "zh-TW": "chi_tra",

    "tr": "tur",

    "vi": "vie",

    "nl": "nld",

    "pl": "pol",

    "uk": "ukr",

    "ro": "ron",

    "cs": "ces",

    "sv": "swe",

    "da": "dan",

    "fi": "fin",

    "el": "ell",

    "he": "heb",

    "hu": "hun",

    "id": "ind",

    "no": "nor",

    "sk": "slk"

};


/*
 * =========================================================
 * GET OCR LANGUAGE
 * =========================================================
 */

function getPDFOCRLanguage() {

    const selected =
        pdfSourceLanguage
            ? pdfSourceLanguage.value
            : "auto";


    /*
     * For automatic source language detection we use the
     * three languages most commonly required by this app.
     *
     * This is intentionally the same behavior as app.js.
     */

    if (
        selected === "auto"
    ) {

        return "eng+hin+guj";

    }


    return (
        PDF_OCR_LANGUAGES[selected] ||
        "eng"
    );

}


/*
 * =========================================================
 * STATUS
 * =========================================================
 */

function pdfStatus(
    message
) {

    console.log(
        "[PDF]",
        message
    );


    /*
     * Re-use existing OCR status if available.
     */
    const status =
        document.getElementById(
            "ocrStatus"
        );


    if (status) {

        status.textContent =
            message;

        status.classList.remove(
            "hidden"
        );

    }

}


/*
 * =========================================================
 * PROGRESS
 * =========================================================
 */

function pdfProgress(
    percent
) {

    const container =
        document.getElementById(
            "ocrProgressContainer"
        );

    const progress =
        document.getElementById(
            "ocrProgress"
        );


    if (!container || !progress) {
        return;
    }


    container.classList.remove(
        "hidden"
    );


    const value =
        Math.max(
            0,
            Math.min(
                100,
                percent
            )
        );


    progress.style.width =
        `${value}%`;

}


/*
 * =========================================================
 * HIDE PROGRESS
 * =========================================================
 */

function hidePDFProgress() {

    const container =
        document.getElementById(
            "ocrProgressContainer"
        );


    if (container) {

        container.classList.add(
            "hidden"
        );

    }

}


/*
 * =========================================================
 * ERROR
 * =========================================================
 */

function pdfShowError(
    message
) {

    console.error(
        "[PDF]",
        message
    );


    if (
        pdfErrorMessage
    ) {

        pdfErrorMessage.textContent =
            message;

        pdfErrorMessage.classList.remove(
            "hidden"
        );

    }

}


/*
 * =========================================================
 * HIDE ERROR
 * =========================================================
 */

function pdfHideError() {

    if (
        pdfErrorMessage
    ) {

        pdfErrorMessage.textContent =
            "";

        pdfErrorMessage.classList.add(
            "hidden"
        );

    }

}


/*
 * =========================================================
 * API TRANSLATION RESULT
 * =========================================================
 */

function getPDFTranslation(
    data
) {

    if (!data) {

        return "";

    }


    if (
        typeof data ===
        "string"
    ) {

        return data;

    }


    if (
        typeof data.result ===
        "string"
    ) {

        return data.result;

    }


    if (
        typeof data.translation ===
        "string"
    ) {

        return data.translation;

    }


    if (
        typeof data.translatedText ===
        "string"
    ) {

        return data.translatedText;

    }


    if (
        typeof data.text ===
        "string"
    ) {

        return data.text;

    }


    return "";

}


/*
 * =========================================================
 * TRANSLATE TEXT
 * =========================================================
 */

async function translatePDFText(
    text,
    source,
    target
) {

    const clean =
        String(text || "")
            .trim();


    if (!clean) {

        return "";

    }


    /*
     * Same language.
     */

    if (
        source !== "auto" &&
        source === target
    ) {

        return clean;

    }


    const params =
        new URLSearchParams();


    params.set(
        "sl",
        source
    );


    params.set(
        "tl",
        target
    );


    params.set(
        "q",
        clean
    );


    const response =
        await fetch(
            `${PDF_API_URL}?${params.toString()}`,
            {
                method: "GET",

                headers: {
                    "Accept":
                        "application/json"
                }
            }
        );


    if (!response.ok) {

        throw new Error(
            `Translation API returned HTTP ${response.status}`
        );

    }


    const data =
        await response.json();


    const translated =
        getPDFTranslation(
            data
        );


    if (!translated) {

        throw new Error(
            "Translation API returned no text."
        );

    }


    return translated;

}


/*
 * =========================================================
 * LOAD PDF
 * =========================================================
 */

async function loadPDF(
    file
) {

    if (
        typeof pdfjsLib ===
        "undefined"
    ) {

        throw new Error(
            "PDF.js could not be loaded."
        );

    }


    const buffer =
        await file.arrayBuffer();


    const loadingTask =
        pdfjsLib.getDocument(
            {
                data:
                    buffer
            }
        );


    return (
        await loadingTask.promise
    );

}


/*
 * =========================================================
 * RENDER PDF PAGE
 * =========================================================
 */

async function renderPDFPage(
    page
) {

    const viewport =
        page.getViewport(
            {
                scale:
                    PDF_RENDER_SCALE
            }
        );


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
                alpha:
                    false
            }
        );


    /*
     * White background.
     */
    context.save();

    context.fillStyle =
        "#ffffff";

    context.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    context.restore();


    await page.render(
        {
            canvasContext:
                context,

            viewport:
                viewport
        }
    ).promise;


    return {

        canvas:
            canvas,

        viewport:
            viewport

    };

}


/*
 * =========================================================
 * OCR IMAGE
 * =========================================================
 *
 * Tesseract.js supports requesting detailed output such as
 * blocks/hOCR. We request blocks and TSV-related information
 * where available so the text can be associated with
 * coordinates on the original page.
 *
 * =========================================================
 */

async function OCRPDFPage(
    worker,
    canvas
) {

    await worker.setParameters(
        {

            tessedit_pageseg_mode:
                "6",

            preserve_interword_spaces:
                "1"

        }
    );


    const result =
        await worker.recognize(
            canvas,
            {},
            {
                blocks:
                    true,

                hocr:
                    true,

                tsv:
                    true

            }
        );


    return result;

}


/*
 * =========================================================
 * EXTRACT WORDS
 * =========================================================
 */

function extractOCRWords(
    data
) {

    const words =
        [];


    /*
     * Tesseract normally provides data.words.
     */

    if (
        data &&
        Array.isArray(
            data.words
        )
    ) {

        data.words.forEach(
            function (word) {

                if (
                    !word ||
                    !word.text ||
                    !word.bbox
                ) {

                    return;

                }


                const text =
                    String(
                        word.text
                    ).trim();


                if (!text) {

                    return;

                }


                const confidence =
                    Number(
                        word.confidence
                    ) || 0;


                if (
                    confidence <
                    PDF_OCR_MIN_CONFIDENCE
                ) {

                    return;

                }


                words.push(
                    {

                        text:
                            text,

                        confidence:
                            confidence,

                        bbox:
                            {

                                x0:
                                    Number(
                                        word.bbox.x0
                                    ),

                                y0:
                                    Number(
                                        word.bbox.y0
                                    ),

                                x1:
                                    Number(
                                        word.bbox.x1
                                    ),

                                y1:
                                    Number(
                                        word.bbox.y1
                                    )

                            }

                    }
                );

            }
        );

    }


    return words;

}


/*
 * =========================================================
 * GROUP WORDS INTO LINES
 * =========================================================
 *
 * OCR gives individual words.
 *
 * We group words with similar vertical positions into lines.
 *
 * This is important because translating individual words
 * destroys grammar.
 *
 * =========================================================
 */

function groupWordsIntoLines(
    words
) {

    if (
        !words ||
        !words.length
    ) {

        return [];

    }


    const sorted =
        words
            .slice()
            .sort(
                function (a, b) {

                    const ay =
                        (
                            a.bbox.y0 +
                            a.bbox.y1
                        ) / 2;


                    const by =
                        (
                            b.bbox.y0 +
                            b.bbox.y1
                        ) / 2;


                    if (
                        Math.abs(
                            ay - by
                        ) < 8
                    ) {

                        return (
                            a.bbox.x0 -
                            b.bbox.x0
                        );

                    }


                    return ay - by;

                }
            );


    const lines =
        [];


    for (
        const word of sorted
    ) {

        const centerY =
            (
                word.bbox.y0 +
                word.bbox.y1
            ) / 2;


        let bestLine =
            null;


        let bestDifference =
            Infinity;


        for (
            const line of lines
        ) {

            const difference =
                Math.abs(
                    centerY -
                    line.centerY
                );


            /*
             * Allow a tolerance based on text height.
             */
            const tolerance =
                Math.max(
                    8,
                    line.height * 0.65
                );


            if (
                difference <=
                tolerance
            ) {

                if (
                    difference <
                    bestDifference
                ) {

                    bestLine =
                        line;

                    bestDifference =
                        difference;

                }

            }

        }


        if (!bestLine) {

            bestLine =
                {

                    words:
                        [word],

                    centerY:
                        centerY,

                    height:
                        word.bbox.y1 -
                        word.bbox.y0

                };


            lines.push(
                bestLine
            );


        } else {

            bestLine.words.push(
                word
            );


            bestLine.centerY =
                (
                    bestLine.centerY +
                    centerY
                ) / 2;


            bestLine.height =
                Math.max(
                    bestLine.height,
                    word.bbox.y1 -
                    word.bbox.y0
                );

        }

    }


    /*
     * Sort words inside each line.
     */

    lines.forEach(
        function (line) {

            line.words.sort(
                function (a, b) {

                    return (
                        a.bbox.x0 -
                        b.bbox.x0
                    );

                }
            );


            line.text =
                line.words
                    .map(
                        function (word) {
                            return word.text;
                        }
                    )
                    .join(" ");


            const first =
                line.words[0];

            const last =
                line.words[
                    line.words.length - 1
                ];


            line.bbox =
                {

                    x0:
                        first.bbox.x0,

                    y0:
                        Math.min(
                            ...line.words.map(
                                w =>
                                    w.bbox.y0
                            )
                        ),

                    x1:
                        last.bbox.x1,

                    y1:
                        Math.max(
                            ...line.words.map(
                                w =>
                                    w.bbox.y1
                            )
                        )

                };

        }
    );


    return lines;

}


/*
 * =========================================================
 * MERGE VERY SHORT LINES
 * =========================================================
 *
 * Some PDFs cause Tesseract to split one sentence into
 * several tiny lines.
 *
 * We merge lines when their vertical spacing is very small.
 *
 * =========================================================
 */

function mergeOCRLines(
    lines
) {

    if (
        !lines ||
        lines.length < 2
    ) {

        return lines || [];

    }


    const result =
        [];


    for (
        const line of lines
    ) {

        if (
            !result.length
        ) {

            result.push(
                line
            );

            continue;

        }


        const previous =
            result[
                result.length - 1
            ];


        const gap =
            line.bbox.y0 -
            previous.bbox.y1;


        const height =
            Math.max(
                previous.bbox.y1 -
                previous.bbox.y0,

                line.bbox.y1 -
                line.bbox.y0
            );


        /*
         * Only merge when the lines are extremely close.
         */
        if (
            gap >= 0 &&
            gap < height * 0.25
        ) {

            previous.text +=
                " " +
                line.text;


            previous.words =
                previous.words.concat(
                    line.words
                );


            previous.bbox.x0 =
                Math.min(
                    previous.bbox.x0,
                    line.bbox.x0
                );


            previous.bbox.y0 =
                Math.min(
                    previous.bbox.y0,
                    line.bbox.y0
                );


            previous.bbox.x1 =
                Math.max(
                    previous.bbox.x1,
                    line.bbox.x1
                );


            previous.bbox.y1 =
                Math.max(
                    previous.bbox.y1,
                    line.bbox.y1
                );

        } else {

            result.push(
                line
            );

        }

    }


    return result;

}


/*
 * =========================================================
 * CLEAN OCR LINE
 * =========================================================
 */

function cleanPDFOCRText(
    text
) {

    if (!text) {

        return "";

    }


    return String(
        text
    )
        .replace(
            /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,
            ""
        )
        .replace(
            /\uFFFD/g,
            ""
        )
        .replace(
            /[ \t]{2,}/g,
            " "
        )
        .trim();

}


/*
 * =========================================================
 * GET FONT SIZE
 * =========================================================
 */

function estimateFontSize(
    line
) {

    const height =
        line.bbox.y1 -
        line.bbox.y0;


    /*
     * OCR coordinate is in rendered canvas pixels.
     *
     * The browser canvas text is rendered at approximately
     * 80–90% of the detected character height.
     */

    return Math.max(
        8,
        Math.min(
            120,
            height * 0.82
        )
    );

}


/*
 * =========================================================
 * DETERMINE FONT FAMILY
 * =========================================================
 */

function getTranslationFont(
    language
) {

    switch (
        language
    ) {

        case "gu":

        case "hi":

        case "mr":

        case "bn":

        case "pa":

        case "ta":

        case "te":

        case "kn":

        case "ml":

        case "sa":

        case "ne":

        case "ur":

            return (
                "Arial, " +
                "\"Noto Sans\", " +
                "\"Noto Sans Gujarati\", " +
                "\"Noto Sans Devanagari\", " +
                "sans-serif"
            );


        case "ja":

            return (
                "\"Noto Sans JP\", " +
                "\"Yu Gothic\", " +
                "sans-serif"
            );


        case "zh-CN":

        case "zh-TW":

            return (
                "\"Noto Sans CJK SC\", " +
                "\"Noto Sans CJK TC\", " +
                "sans-serif"
            );


        case "ko":

            return (
                "\"Noto Sans KR\", " +
                "sans-serif"
            );


        default:

            return (
                "Arial, " +
                "\"Noto Sans\", " +
                "sans-serif"
            );

    }

}


/*
 * =========================================================
 * WRAP TRANSLATED TEXT
 * =========================================================
 */

function wrapCanvasText(
    ctx,
    text,
    maxWidth
) {

    const words =
        String(text || "")
            .split(/\s+/)
            .filter(Boolean);


    if (!words.length) {

        return [];

    }


    const lines =
        [];


    let current =
        "";


    for (
        const word of words
    ) {

        const test =
            current
                ? `${current} ${word}`
                : word;


        const width =
            ctx.measureText(
                test
            ).width;


        if (
            width <=
            maxWidth
        ) {

            current =
                test;

        } else {

            if (current) {

                lines.push(
                    current
                );

            }


            /*
             * A single long word may itself be wider than
             * the available area.
             */
            current =
                word;

        }

    }


    if (current) {

        lines.push(
            current
        );

    }


    return lines;

}


/*
 * =========================================================
 * DRAW TRANSLATED LINE
 * =========================================================
 *
 * IMPORTANT:
 *
 * The original PDF page is already the background.
 *
 * We cover only the OCR text area and paint the translation.
 *
 * Logos/images remain part of the original page.
 *
 * Table lines outside the text area remain untouched.
 *
 * =========================================================
 */

function drawTranslatedLine(
    ctx,
    line,
    translatedText,
    targetLanguage
) {

    if (
        !translatedText ||
        !line ||
        !line.bbox
    ) {

        return;

    }


    const x =
        line.bbox.x0;

    const y =
        line.bbox.y0;

    const width =
        Math.max(
            10,
            line.bbox.x1 -
            line.bbox.x0
        );

    const height =
        Math.max(
            10,
            line.bbox.y1 -
            line.bbox.y0
        );


    const fontSize =
        estimateFontSize(
            line
        );


    const fontFamily =
        getTranslationFont(
            targetLanguage
        );


    /*
     * Add a little padding.
     */
    const padding =
        Math.max(
            2,
            Math.round(
                fontSize * 0.08
            )
        );


    /*
     * Measure the translation.
     */
    ctx.save();


    ctx.font =
        `${fontSize}px ${fontFamily}`;


    ctx.textBaseline =
        "top";


    const wrapped =
        wrapCanvasText(
            ctx,
            translatedText,
            width
        );


    /*
     * Determine required height.
     */
    const lineHeight =
        fontSize *
        1.15;


    const requiredHeight =
        Math.max(
            height,
            wrapped.length *
            lineHeight
        );


    /*
     * White-out only the text region.
     *
     * The padding is intentionally small so table borders
     * remain visible in most documents.
     */
    ctx.fillStyle =
        "#ffffff";


    ctx.fillRect(
        Math.max(
            0,
            x - padding
        ),

        Math.max(
            0,
            y - padding
        ),

        Math.min(
            ctx.canvas.width -
            Math.max(
                0,
                x - padding
            ),

            width +
            padding * 2
        ),

        Math.min(
            ctx.canvas.height -
            Math.max(
                0,
                y - padding
            ),

            requiredHeight +
            padding * 2
        )
    );


    /*
     * Draw translation.
     */
    ctx.fillStyle =
        "#000000";


    let drawY =
        y;


    for (
        const wrappedLine of wrapped
    ) {

        ctx.fillText(
            wrappedLine,
            x,
            drawY
        );


        drawY +=
            lineHeight;

    }


    ctx.restore();

}


/*
 * =========================================================
 * CREATE TRANSLATED PAGE
 * =========================================================
 */

function createTranslatedPage(
    originalCanvas,
    lines,
    translatedLines,
    targetLanguage
) {

    const canvas =
        document.createElement(
            "canvas"
        );


    canvas.width =
        originalCanvas.width;

    canvas.height =
        originalCanvas.height;


    const ctx =
        canvas.getContext(
            "2d"
        );


    /*
     * Original page.
     */
    ctx.drawImage(
        originalCanvas,
        0,
        0
    );


    /*
     * Apply translations.
     */
    for (
        let i = 0;
        i < lines.length;
        i++
    ) {

        const translated =
            translatedLines[i];


        if (!translated) {

            continue;

        }


        drawTranslatedLine(
            ctx,
            lines[i],
            translated,
            targetLanguage
        );

    }


    return canvas;

}


/*
 * =========================================================
 * TRANSLATE LINES
 * =========================================================
 */

async function translatePDFLines(
    lines,
    source,
    target
) {

    const translated =
        [];


    for (
        let i = 0;
        i < lines.length;
        i++
    ) {

        const line =
            lines[i];


        const text =
            cleanPDFOCRText(
                line.text
            );


        if (!text) {

            translated.push(
                ""
            );

            continue;

        }


        pdfStatus(
            `🌎 Translating text ${i + 1} of ${lines.length}…`
        );


        try {

            const result =
                await translatePDFText(
                    text,
                    source,
                    target
                );


            translated.push(
                result
            );


        } catch (error) {

            console.error(
                "Line translation failed:",
                error
            );


            /*
             * Keep original OCR text if one translation request
             * fails. This is safer than deleting the content.
             */
            translated.push(
                text
            );

        }


        /*
         * Small delay prevents hammering the API.
         */
        if (
            PDF_TRANSLATION_DELAY >
            0
        ) {

            await new Promise(
                function (resolve) {

                    setTimeout(
                        resolve,
                        PDF_TRANSLATION_DELAY
                    );

                }
            );

        }

    }


    return translated;

}


/*
 * =========================================================
 * PDF PAGE SIZE
 * =========================================================
 */

function getPDFPageSize(
    page
) {

    const view =
        page.view;


    const width =
        Math.abs(
            view[2] -
            view[0]
        );


    const height =
        Math.abs(
            view[3] -
            view[1]
        );


    return {

        width:
            width,

        height:
            height

    };

}


/*
 * =========================================================
 * CREATE PDF
 * =========================================================
 */

async function createOutputPDF(
    pages
) {

    if (
        !window.jspdf ||
        !window.jspdf.jsPDF
    ) {

        throw new Error(
            "jsPDF could not be loaded."
        );

    }


    const {
        jsPDF
    } =
        window.jspdf;


    if (
        !pages.length
    ) {

        throw new Error(
            "No PDF pages were generated."
        );

    }


    const first =
        pages[0];


    const firstSize =
        first.size;


    /*
     * jsPDF uses points.
     *
     * PDF.js page dimensions are also effectively based on
     * 72 DPI PDF points.
     */

    const orientation =
        firstSize.width >
        firstSize.height
            ? "landscape"
            : "portrait";


    const pdf =
        new jsPDF(
            {
                orientation:
                    orientation,

                unit:
                    "pt",

                format:
                    [
                        firstSize.width,
                        firstSize.height
                    ],

                compress:
                    true

            }
        );


    /*
     * Remove default blank page content by replacing it with
     * the first page image.
     */
    for (
        let i = 0;
        i < pages.length;
        i++
    ) {

        if (
            i > 0
        ) {

            const size =
                pages[i].size;


            pdf.addPage(
                [
                    size.width,
                    size.height
                ],

                size.width >
                size.height
                    ? "landscape"
                    : "portrait"
            );

        }


        const page =
            pages[i];


        /*
         * JPEG is used here because scanned PDF pages can be
         * very large and PNG would produce enormous output files.
         *
         * Quality 0.95 keeps logos and text reasonably sharp.
         */
        const image =
            page.canvas.toDataURL(
                "image/jpeg",
                0.95
            );


        pdf.addImage(
            image,
            "JPEG",
            0,
            0,
            page.size.width,
            page.size.height,
            undefined,
            "FAST"
        );

    }


    return pdf;

}


/*
 * =========================================================
 * DOWNLOAD
 * =========================================================
 */

function downloadTranslatedPDF(
    pdf,
    originalFile
) {

    const originalName =
        originalFile.name
            .replace(
                /\.pdf$/i,
                ""
            );


    const fileName =
        `${originalName}_translated.pdf`;


    pdf.save(
        fileName
    );

}


/*
 * =========================================================
 * MAIN PDF PROCESSOR
 * ========================================================= */

async function processPDF(
    file
) {

    if (
        pdfProcessing
    ) {

        return;

    }


    if (!file) {

        return;

    }


    if (
        file.type !==
        "application/pdf" &&
        !/\.pdf$/i.test(
            file.name
        )
    ) {

        pdfShowError(
            "Please select a PDF file."
        );

        return;

    }


    if (
        typeof Tesseract ===
        "undefined"
    ) {

        pdfShowError(
            "OCR library could not be loaded."
        );

        return;

    }


    if (
        typeof pdfjsLib ===
        "undefined"
    ) {

        pdfShowError(
            "PDF.js could not be loaded."
        );

        return;

    }


    pdfProcessing =
        true;


    pdfHideError();


    let worker =
        null;


    try {

        const source =
            pdfSourceLanguage
                ? pdfSourceLanguage.value
                : "auto";


        const target =
            pdfTargetLanguage
                ? pdfTargetLanguage.value
                : "en";


        /*
         * =================================================
         * LOAD PDF
         * =================================================
         */

        pdfStatus(
            "📄 Opening PDF…"
        );


        pdfProgress(
            3
        );


        const pdf =
            await loadPDF(
                file
            );


        const totalPages =
            Math.min(
                pdf.numPages,
                PDF_MAX_PAGES
            );


        if (
            pdf.numPages >
            PDF_MAX_PAGES
        ) {

            console.warn(
                `PDF contains ${pdf.numPages} pages. ` +
                `Only first ${PDF_MAX_PAGES} pages will be processed.`
            );

        }


        /*
         * =================================================
         * OCR WORKER
         * =================================================
         */

        pdfStatus(
            "📚 Loading OCR language…"
        );


        const ocrLanguage =
            getPDFOCRLanguage();


        worker =
            await Tesseract.createWorker(
                ocrLanguage,
                1,
                {

                    logger:
                        function (message) {

                            if (
                                typeof message.progress ===
                                "number"
                            ) {

                                console.log(
                                    "[PDF OCR]",
                                    message.status,
                                    message.progress
                                );

                            }

                        }

                }
            );


        const outputPages =
            [];


        /*
         * =================================================
         * PROCESS EACH PAGE
         * =================================================
         */

        for (
            let pageNumber = 1;
            pageNumber <= totalPages;
            pageNumber++
        ) {

            const pagePercent =
                (
                    (pageNumber - 1) /
                    totalPages
                ) *
                90;


            pdfProgress(
                5 +
                pagePercent
            );


            pdfStatus(
                `📄 Rendering page ${pageNumber} of ${totalPages}…`
            );


            const page =
                await pdf.getPage(
                    pageNumber
                );


            const rendered =
                await renderPDFPage(
                    page
                );


            /*
             * =================================================
             * OCR
             * =================================================
             */

            pdfStatus(
                `🔎 OCR page ${pageNumber} of ${totalPages}…`
            );


            const ocrResult =
                await OCRPDFPage(
                    worker,
                    rendered.canvas
                );


            const words =
                extractOCRWords(
                    ocrResult.data
                );


            let lines =
                groupWordsIntoLines(
                    words
                );


            lines =
                mergeOCRLines(
                    lines
                );


            /*
             * Sort vertically.
             */
            lines.sort(
                function (a, b) {

                    if (
                        Math.abs(
                            a.bbox.y0 -
                            b.bbox.y0
                        ) < 5
                    ) {

                        return (
                            a.bbox.x0 -
                            b.bbox.x0
                        );

                    }


                    return (
                        a.bbox.y0 -
                        b.bbox.y0
                    );

                }
            );


            /*
             * =================================================
             * TRANSLATION
             * =================================================
             */

            let translatedLines =
                [];


            if (
                lines.length
            ) {

                translatedLines =
                    await translatePDFLines(
                        lines,
                        source,
                        target
                    );

            }


            /*
             * =================================================
             * BUILD TRANSLATED PAGE
             * =================================================
             */

            pdfStatus(
                `🎨 Rebuilding page ${pageNumber}…`
            );


            const translatedCanvas =
                createTranslatedPage(
                    rendered.canvas,
                    lines,
                    translatedLines,
                    target
                );


            const size =
                getPDFPageSize(
                    page
                );


            outputPages.push(
                {

                    canvas:
                        translatedCanvas,

                    size:
                        size

                }
            );


            pdfProgress(
                5 +
                (
                    pageNumber /
                    totalPages
                ) *
                90
            );

        }


        /*
         * =================================================
         * TERMINATE OCR
         * =================================================
         */

        if (worker) {

            await worker.terminate();

            worker =
                null;

        }


        /*
         * =================================================
         * GENERATE PDF
         * =================================================
         */

        pdfStatus(
            "📦 Creating translated PDF…"
        );


        pdfProgress(
            97
        );


        const outputPDF =
            await createOutputPDF(
                outputPages
            );


        /*
         * =================================================
         * DOWNLOAD
         * =================================================
         */

        pdfStatus(
            "⬇️ Downloading translated PDF…"
        );


        pdfProgress(
            100
        );


        downloadTranslatedPDF(
            outputPDF,
            file
        );


        pdfStatus(
            "✅ PDF translation completed."
        );


        setTimeout(
            function () {

                hidePDFProgress();

            },
            2500
        );


    } catch (error) {

        console.error(
            "PDF processing error:",
            error
        );


        if (worker) {

            try {

                await worker.terminate();

            } catch (
                terminateError
            ) {

                console.error(
                    terminateError
                );

            }

        }


        hidePDFProgress();


        pdfShowError(
            `PDF processing failed: ${error.message || error}`
        );


        pdfStatus(
            "❌ PDF processing failed."
        );


    } finally {

        pdfProcessing =
            false;

    }

}


/*
 * =========================================================
 * PDF INPUT EVENT
 * =========================================================
 */

if (
    pdfInput
) {

    pdfInput.addEventListener(
        "change",
        async function () {

            const file =
                this.files &&
                this.files.length
                    ? this.files[0]
                    : null;


            /*
             * Reset immediately so the same PDF can be
             * selected again.
             */
            this.value =
                "";


            if (!file) {

                return;

            }


            await processPDF(
                file
            );

        }
    );

}


/*
 * =========================================================
 * INITIALIZATION
 * =========================================================
 */

console.log(
    "Dhiren Translate PDF OCR loaded."
);
