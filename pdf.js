"use strict";

/*
===========================================================
 Dhiren Translate
 PDF OCR + Translation
===========================================================
*/


/* =========================================================
   CONFIG
   ========================================================= */

const PDFJS_VERSION = "3.11.174";

const PDFJS_WORKER =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

const API_BASE = "/api/";

const PDF_RENDER_SCALE = 2;

const JPEG_QUALITY = 0.90;


/* =========================================================
   DOM
   ========================================================= */

const pdfInput =
    document.getElementById("pdfInput");

const sourceLanguage =
    document.getElementById("sourceLanguage");

const targetLanguage =
    document.getElementById("targetLanguage");

const ocrStatus =
    document.getElementById("ocrStatus");

const ocrProgressContainer =
    document.getElementById(
        "ocrProgressContainer"
    );

const ocrProgress =
    document.getElementById(
        "ocrProgress"
    );

const translationStatus =
    document.getElementById(
        "translationStatus"
    );

const errorMessage =
    document.getElementById(
        "errorMessage"
    );

const sourceText =
    document.getElementById(
        "sourceText"
    );


/* =========================================================
   LOG
   ========================================================= */

console.log(
    "========================================"
);

console.log(
    "Dhiren Translate PDF module loaded"
);

console.log(
    "PDF input:",
    pdfInput
);

console.log(
    "PDF.js:",
    typeof pdfjsLib !== "undefined"
        ? pdfjsLib.version
        : "NOT LOADED"
);

console.log(
    "jsPDF:",
    typeof window.jspdf !== "undefined"
        ? "LOADED"
        : "NOT LOADED"
);

console.log(
    "Tesseract:",
    typeof Tesseract !== "undefined"
        ? "LOADED"
        : "NOT LOADED"
);

console.log(
    "========================================"
);


/* =========================================================
   PDF.JS WORKER
   ========================================================= */

if (
    typeof pdfjsLib !==
    "undefined"
) {

    pdfjsLib.GlobalWorkerOptions.workerSrc =
        PDFJS_WORKER;

}


/* =========================================================
   STATUS
   ========================================================= */

function setStatus(
    message
) {

    console.log(
        "[PDF]",
        message
    );


    if (ocrStatus) {

        ocrStatus.textContent =
            message;

        ocrStatus.classList.remove(
            "hidden"
        );

    }

}


/* =========================================================
   PROGRESS
   ========================================================= */

function setProgress(
    value
) {

    value =
        Math.max(
            0,
            Math.min(
                100,
                value
            )
        );


    if (
        ocrProgressContainer
    ) {

        ocrProgressContainer.classList.remove(
            "hidden"
        );

    }


    if (
        ocrProgress
    ) {

        ocrProgress.style.width =
            value + "%";

    }

}


/* =========================================================
   ERROR
   ========================================================= */

function showError(
    message
) {

    console.error(
        "[PDF ERROR]",
        message
    );


    if (errorMessage) {

        errorMessage.textContent =
            "❌ " + message;

        errorMessage.classList.remove(
            "hidden"
        );

    }


    setStatus(
        "❌ " + message
    );

}


/* =========================================================
   CLEAR ERROR
   ========================================================= */

function clearError() {

    if (errorMessage) {

        errorMessage.textContent =
            "";

        errorMessage.classList.add(
            "hidden"
        );

    }

}


/* =========================================================
   LIBRARY CHECK
   ========================================================= */

function checkLibraries() {

    console.log(
        "Checking PDF libraries..."
    );


    if (
        typeof pdfjsLib ===
        "undefined"
    ) {

        throw new Error(
            "PDF.js is not loaded. Check the PDF.js CDN in index.html."
        );

    }


    if (
        typeof window.jspdf ===
        "undefined"
    ) {

        throw new Error(
            "jsPDF is not loaded. Check the jsPDF CDN in index.html."
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


    if (
        typeof Tesseract ===
        "undefined"
    ) {

        throw new Error(
            "Tesseract.js is not loaded."
        );

    }


    console.log(
        "All libraries OK."
    );

}


/* =========================================================
   OCR LANGUAGE MAP
   ========================================================= */

const OCR_LANGUAGES = {

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
   GET SOURCE LANGUAGE
   ========================================================= */

function getSourceLanguage() {

    if (
        !sourceLanguage
    ) {

        return "auto";

    }


    return (
        sourceLanguage.value ||
        "auto"
    );

}


/* =========================================================
   GET TARGET LANGUAGE
   ========================================================= */

function getTargetLanguage() {

    if (
        !targetLanguage
    ) {

        return "en";

    }


    return (
        targetLanguage.value ||
        "en"
    );

}


/* =========================================================
   GET OCR LANGUAGE
   ========================================================= */

function getOCRLanguage() {

    let language =
        getSourceLanguage();


    language =
        String(language)
            .toLowerCase()
            .split("-")[0]
            .split("_")[0];


    return (
        OCR_LANGUAGES[language] ||
        "eng"
    );

}


/* =========================================================
   READ PDF FILE
   ========================================================= */

async function loadPDF(
    file
) {

    setStatus(
        "📖 Opening PDF..."
    );

    setProgress(
        5
    );


    const buffer =
        await file.arrayBuffer();


    if (
        !buffer ||
        buffer.byteLength === 0
    ) {

        throw new Error(
            "The PDF file is empty."
        );

    }


    console.log(
        "PDF size:",
        buffer.byteLength,
        "bytes"
    );


    const loadingTask =
        pdfjsLib.getDocument({

            data:
                new Uint8Array(
                    buffer
                )

        });


    const pdf =
        await loadingTask.promise;


    console.log(
        "PDF loaded.",
        "Pages:",
        pdf.numPages
    );


    if (
        !pdf.numPages
    ) {

        throw new Error(
            "PDF has no pages."
        );

    }


    return pdf;

}


/* =========================================================
   RENDER PAGE
   ========================================================= */

async function renderPage(
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


    await page.render({

        canvasContext:
            context,

        viewport:
            viewport

    }).promise;


    return {

        canvas,

        viewport

    };

}


/* =========================================================
   OCR PAGE
   ========================================================= */

async function recognizePage(
    canvas,
    pageNumber,
    totalPages
) {

    const language =
        getOCRLanguage();


    setStatus(

        `🔍 OCR page ${pageNumber} of ${totalPages}...`

    );


    console.log(
        "OCR language:",
        language
    );


    let worker;


    try {

        worker =
            await Tesseract.createWorker(
                language,
                1,
                {

                    logger:
                        function(info) {

                            if (
                                info.status ===
                                "recognizing text"
                            ) {

                                const progress =
                                    info.progress ||
                                    0;


                                console.log(

                                    `OCR page ${pageNumber}:`,
                                    Math.round(
                                        progress *
                                        100
                                    ) + "%"

                                );

                            }

                        }

                }
            );


        const result =
            await worker.recognize(
                canvas
            );


        console.log(
            "OCR result:",
            result.data
        );


        return result.data;


    } finally {

        if (worker) {

            try {

                await worker.terminate();

            } catch (e) {

                console.warn(
                    "Worker termination error:",
                    e
                );

            }

        }

    }

}


/* =========================================================
   GET OCR LINES
   ========================================================= */

function getLines(
    data
) {

    if (
        data &&
        Array.isArray(
            data.lines
        )
    ) {

        return data.lines
            .filter(
                line =>
                    line &&
                    line.text &&
                    line.bbox
            )
            .map(
                line => ({

                    text:
                        cleanText(
                            line.text
                        ),

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

                })
            )
            .filter(
                line =>
                    line.text.length > 0
            );

    }


    /*
       Fallback if Tesseract doesn't provide lines.
    */

    if (
        data &&
        data.text
    ) {

        const text =
            cleanText(
                data.text
            );


        if (!text) {

            return [];

        }


        return [

            {

                text,

                confidence: 50,

                x0: 20,

                y0: 20,

                x1: 500,

                y1: 60

            }

        ];

    }


    return [];

}


/* =========================================================
   CLEAN TEXT
   ========================================================= */

function cleanText(
    text
) {

    return String(
        text || ""
    )
        .replace(
            /\s+/g,
            " "
        )
        .trim();

}


/* =========================================================
   TRANSLATE ONE LINE
   ========================================================= */

async function translateLine(
    text
) {

    const sl =
        getSourceLanguage();

    const tl =
        getTargetLanguage();


    if (!text) {

        return "";

    }


    /*
       Same language = no translation.
    */

    if (
        String(sl).toLowerCase() ===
        String(tl).toLowerCase()
    ) {

        return text;

    }


    const url =
        API_BASE +
        "?sl=" +
        encodeURIComponent(sl) +
        "&tl=" +
        encodeURIComponent(tl) +
        "&q=" +
        encodeURIComponent(text);


    console.log(
        "Translation request:",
        url
    );


    const response =
        await fetch(
            url,
            {
                method:
                    "GET",

                headers: {

                    "Accept":
                        "application/json,text/plain,*/*"

                }
            }
        );


    if (!response.ok) {

        throw new Error(

            `Translation API returned HTTP ${response.status}`

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


    console.log(
        "Translation response:",
        result
    );


    return extractTranslation(
        result
    );

}


/* =========================================================
   EXTRACT TRANSLATION
   ========================================================= */

function extractTranslation(
    result
) {

    if (
        typeof result ===
        "string"
    ) {

        return result.trim();

    }


    if (
        !result
    ) {

        return "";

    }


    /*
       Common API formats.
    */

    const keys = [

        "translation",

        "translatedText",

        "translated",

        "text",

        "result",

        "response"

    ];


    for (
        const key of keys
    ) {

        if (
            typeof result[key] ===
            "string"
        ) {

            return result[key].trim();

        }

    }


    /*
       Nested data.
    */

    if (
        result.data
    ) {

        if (
            typeof result.data ===
            "string"
        ) {

            return result.data.trim();

        }


        if (
            typeof result.data ===
            "object"
        ) {

            return extractTranslation(
                result.data
            );

        }

    }


    /*
       Array.
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
   SAMPLE BACKGROUND
   ========================================================= */

function getBackgroundColor(
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
            Math.max(
                1,
                Math.floor(
                    line.x1 -
                    line.x0
                )
            );


        const height =
            Math.max(
                1,
                Math.floor(
                    line.y1 -
                    line.y0
                )
            );


        const image =
            ctx.getImageData(
                x,
                y,
                Math.min(
                    width,
                    canvas.width - x
                ),
                Math.min(
                    height,
                    canvas.height - y
                )
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
               Prefer light pixels.
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

    } catch (error) {

        console.warn(
            "Background color failed:",
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
   DRAW TRANSLATED LINE
   ========================================================= */

function drawTranslatedLine(
    pdf,
    canvas,
    line,
    translated,
    pageWidth,
    pageHeight
) {

    if (
        !translated
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
       Small cover area around the original text.
    */

    const pad =
        Math.max(
            1,
            height * 0.10
        );


    const bg =
        getBackgroundColor(
            canvas,
            line
        );


    pdf.setFillColor(

        bg.r,
        bg.g,
        bg.b

    );


    /*
       Cover only OCR text region.
    */

    pdf.rect(

        Math.max(
            0,
            x - pad
        ),

        Math.max(
            0,
            y - pad
        ),

        Math.min(
            width + pad * 2,
            pageWidth -
            Math.max(
                0,
                x - pad
            )
        ),

        Math.min(
            height + pad * 2,
            pageHeight -
            Math.max(
                0,
                y - pad
            )
        ),

        "F"

    );


    /*
       Estimate font size.
    */

    let fontSize =
        Math.max(
            5,
            Math.min(
                30,
                height *
                0.70
            )
        );


    const originalLength =
        Math.max(
            1,
            line.text.length
        );


    const translatedLength =
        Math.max(
            1,
            translated.length
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
       Wrap translated text.
    */

    const textWidth =
        Math.max(
            10,
            width -
            pad * 2
        );


    let wrapped =
        pdf.splitTextToSize(
            translated,
            textWidth
        );


    /*
       Don't allow huge expansion.
    */

    if (
        wrapped.length > 3
    ) {

        fontSize *=
            0.75;


        pdf.setFontSize(
            fontSize
        );


        wrapped =
            pdf.splitTextToSize(
                translated,
                textWidth
            );

    }


    /*
       Keep at most 3 lines.
    */

    wrapped =
        wrapped.slice(
            0,
            3
        );


    /*
       Baseline.
    */

    const baseline =
        y +
        Math.max(
            fontSize,
            height *
            0.78
        );


    pdf.text(

        wrapped,

        x + pad,

        baseline,

        {

            maxWidth:
                textWidth

        }

    );

}


/* =========================================================
   CREATE PDF
   ========================================================= */

function createOutputPDF(
    width,
    height
) {

    const jsPDF =
        window.jspdf.jsPDF;


    return new jsPDF({

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

}


/* =========================================================
   PROCESS PAGE
   ========================================================= */

async function processPage(
    pdfDocument,
    pageNumber,
    totalPages,
    outputPdf
) {

    setStatus(

        `📄 Loading page ${pageNumber} of ${totalPages}...`

    );


    const page =
        await pdfDocument.getPage(
            pageNumber
        );


    const originalViewport =
        page.getViewport({
            scale: 1
        });


    const pageWidth =
        originalViewport.width;


    const pageHeight =
        originalViewport.height;


    /*
       Render page.
    */

    setStatus(

        `🖼️ Rendering page ${pageNumber} of ${totalPages}...`

    );


    const rendered =
        await renderPage(
            page
        );


    const canvas =
        rendered.canvas;


    /*
       OCR.
    */

    const data =
        await recognizePage(

            canvas,

            pageNumber,

            totalPages

        );


    const lines =
        getLines(
            data
        );


    console.log(

        `Page ${pageNumber}:`,
        lines.length,
        "OCR lines"

    );


    /*
       Translate lines.
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


        setStatus(

            `🌎 Translating page ${pageNumber}/${totalPages} — ` +
            `${i + 1}/${lines.length}`

        );


        let translated =
            "";


        try {

            translated =
                await translateLine(
                    line.text
                );


            /*
               If API gives no result, keep original.
            */

            if (
                !translated
            ) {

                translated =
                    line.text;

            }

        } catch (error) {

            console.warn(

                "Line translation failed:",
                line.text,
                error

            );


            /*
               Don't destroy the original content if one
               translation request fails.
            */

            translated =
                line.text;

        }


        translatedLines.push({

            ...line,

            translated

        });


        /*
           Update progress.

           OCR/translation account for roughly 5-90%.
        */

        const pageProgress =
            10 +
            (
                (
                    (
                        pageNumber - 1
                    ) +
                    (
                        (
                            i + 1
                        ) /
                        Math.max(
                            1,
                            lines.length
                        )
                    )
                ) /
                totalPages
            ) *
            80;


        setProgress(
            pageProgress
        );


        /*
           Allow browser repaint.
        */

        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    5
                )
        );

    }


    /*
       Add new page after first.
    */

    if (
        pageNumber > 1
    ) {

        outputPdf.addPage(

            [
                pageWidth,
                pageHeight
            ]

        );

    }


    /*
       Original page as background.
    */

    setStatus(

        `🎨 Preserving original layout of page ${pageNumber}...`

    );


    const pageImage =
        canvas.toDataURL(
            "image/jpeg",
            JPEG_QUALITY
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
       Overlay translations.
    */

    setStatus(

        `✏️ Placing translated text on page ${pageNumber}...`

    );


    for (
        const line
        of translatedLines
    ) {

        drawTranslatedLine(

            outputPdf,

            canvas,

            line,

            line.translated,

            pageWidth,

            pageHeight

        );

    }


    setProgress(

        Math.round(
            (
                pageNumber /
                totalPages
            ) * 100
        )

    );


    return {

        pageNumber,

        lines:
            lines.length

    };

}


/* =========================================================
   MAIN PDF PROCESSOR
   ========================================================= */

async function processPDF(
    file
) {

    console.log(
        "Starting PDF processing:",
        file.name
    );


    checkLibraries();


    setStatus(
        "📥 PDF selected: " +
        file.name
    );


    setProgress(
        2
    );


    /*
       Load PDF.
    */

    const pdf =
        await loadPDF(
            file
        );


    const totalPages =
        pdf.numPages;


    setStatus(

        `📄 PDF loaded successfully — ${totalPages} page${totalPages === 1 ? "" : "s"}`

    );


    /*
       Get first page size.
    */

    const firstPage =
        await pdf.getPage(
            1
        );


    const firstViewport =
        firstPage.getViewport({
            scale: 1
        });


    /*
       Create output document.
    */

    const outputPdf =
        createOutputPDF(

            firstViewport.width,

            firstViewport.height

        );


    /*
       Process pages.
    */

    for (
        let pageNumber = 1;
        pageNumber <= totalPages;
        pageNumber++
    ) {

        await processPage(

            pdf,

            pageNumber,

            totalPages,

            outputPdf

        );

    }


    /*
       Metadata.
    */

    try {

        outputPdf.setProperties({

            title:
                "Translated " +
                file.name,

            subject:
                "OCR translated PDF",

            author:
                "Dhiren Translate",

            creator:
                "Dhiren Translate"

        });

    } catch (error) {

        console.warn(
            "Metadata error:",
            error
        );

    }


    /*
       Filename.
    */

    const cleanName =
        file.name.replace(
            /\.pdf$/i,
            ""
        );


    const outputName =
        "translated_" +
        cleanName +
        ".pdf";


    /*
       Finish.
    */

    setStatus(
        "💾 Creating translated PDF..."
    );


    setProgress(
        98
    );


    /*
       Download.
    */

    outputPdf.save(
        outputName
    );


    setProgress(
        100
    );


    setStatus(

        `✅ Complete! Downloaded ${outputName}`

    );


    if (
        translationStatus
    ) {

        translationStatus.textContent =
            "PDF translated successfully.";

    }


    /*
       Put OCR text into source box only if it is
       reasonably small.

       This does NOT interfere with app.js translation.
    */

    try {

        if (
            sourceText
        ) {

            /*
               We intentionally don't overwrite a user's
               existing text here.
            */

        }

    } catch (error) {

        console.warn(
            error
        );

    }

}


/* =========================================================
   PDF INPUT EVENT
   ========================================================= */

if (
    pdfInput
) {

    console.log(
        "PDF input event listener attached."
    );


    pdfInput.addEventListener(
        "change",
        async function(event) {

            console.log(
                "PDF INPUT CHANGE EVENT"
            );


            clearError();


            const files =
                event.target.files;


            console.log(
                "Selected files:",
                files
            );


            if (
                !files ||
                !files.length
            ) {

                console.log(
                    "No PDF selected."
                );

                return;

            }


            const file =
                files[0];


            console.log(
                "Selected PDF:",
                file.name,
                file.type,
                file.size
            );


            /*
               IMMEDIATELY show something on screen.
            */

            setStatus(

                `📥 PDF selected: ${file.name}`

            );


            try {

                await processPDF(
                    file
                );

            } catch (error) {

                console.error(
                    "FULL PDF ERROR:",
                    error
                );


                showError(

                    error &&
                    error.message
                        ? error.message
                        : "Unknown PDF processing error."

                );

            } finally {

                /*
                   Allow same PDF to be selected again.
                */

                event.target.value =
                    "";

            }

        }
    );

} else {

    console.error(
        "CRITICAL: #pdfInput was not found."
    );

}
