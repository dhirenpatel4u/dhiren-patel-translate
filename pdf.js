"use strict";

/*
===========================================================
 DHIREN TRANSLATE
 PDF OCR + TRANSLATION
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
   LANGUAGE MAP
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
   PROGRESS
   ========================================================= */

function pdfSetProgress(value) {

    value =
        Math.max(
            0,
            Math.min(
                100,
                value
            )
        );


    if (pdfProgressContainer) {

        pdfProgressContainer.classList.remove(
            "hidden"
        );

    }


    if (pdfProgress) {

        pdfProgress.style.width =
            value + "%";

    }

}


/* =========================================================
   ERROR
   ========================================================= */

function pdfShowError(message) {

    console.error(
        "[PDF ERROR]",
        message
    );


    if (pdfError) {

        pdfError.textContent =
            "❌ " + message;

        pdfError.classList.remove(
            "hidden"
        );

    }


    pdfSetStatus(
        "❌ " + message
    );

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
   LIBRARY CHECK
   ========================================================= */

function pdfCheckLibraries() {

    console.log(
        "Checking libraries..."
    );


    console.log(
        "pdfjsLib:",
        typeof pdfjsLib
    );


    console.log(
        "Tesseract:",
        typeof Tesseract
    );


    console.log(
        "window.jspdf:",
        typeof window.jspdf
    );


    if (
        typeof pdfjsLib ===
        "undefined"
    ) {

        throw new Error(
            "PDF.js is not loaded."
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
        "All libraries loaded successfully."
    );

}


/* =========================================================
   INITIALIZE PDF.JS
   ========================================================= */

if (
    typeof pdfjsLib !==
    "undefined"
) {

    pdfjsLib.GlobalWorkerOptions.workerSrc =
        PDF_WORKER_URL;


    console.log(
        "PDF.js worker configured."
    );

}


/* =========================================================
   GET LANGUAGE
   ========================================================= */

function pdfGetSourceLanguage() {

    if (
        !pdfSourceLanguage
    ) {

        return "auto";

    }


    return (
        pdfSourceLanguage.value ||
        "auto"
    );

}


function pdfGetTargetLanguage() {

    if (
        !pdfTargetLanguage
    ) {

        return "en";

    }


    return (
        pdfTargetLanguage.value ||
        "en"
    );

}


/* =========================================================
   OCR LANGUAGE
   ========================================================= */

function pdfGetOCRLanguage() {

    let lang =
        pdfGetSourceLanguage();


    lang =
        String(lang)
            .toLowerCase()
            .split("-")[0]
            .split("_")[0];


    return (
        PDF_OCR_LANGUAGE_MAP[lang] ||
        "eng"
    );

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
        pdfjsLib.getDocument({

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
        "Number of pages:",
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
        await Tesseract.createWorker(

            language,

            1,

            {

                logger:
                    function(info) {

                        if (
                            info.status ===
                            "loading language"
                        ) {

                            console.log(
                                "Loading OCR language:",
                                info.progress
                            );

                        }


                        if (
                            info.status ===
                            "initializing api"
                        ) {

                            console.log(
                                "Initializing OCR:"
                            );

                        }


                        if (
                            info.status ===
                            "recognizing text"
                        ) {

                            console.log(

                                "OCR:",
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


    console.log(

        `OCR page ${pageNumber} result:`,
        result.data

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

                })
            )

            .filter(
                line =>
                    line.text.length > 0
            );

    }


    return [];

}


/* =========================================================
   TRANSLATE TEXT
   ========================================================= */

async function pdfTranslateText(
    text
) {

    const sl =
        pdfGetSourceLanguage();

    const tl =
        pdfGetTargetLanguage();


    if (
        !text
    ) {

        return "";

    }


    /*
       Same language.
    */

    if (
        String(sl).toLowerCase() ===
        String(tl).toLowerCase()
    ) {

        return text;

    }


    const url =
        API_BASE_FOR_PDF(
            sl,
            tl,
            text
        );


    console.log(
        "Translation URL:",
        url
    );


    const response =
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


    if (
        !response.ok
    ) {

        throw new Error(

            `Translation API error: HTTP ${response.status}`

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


    return pdfExtractTranslation(
        data
    );

}


/* =========================================================
   API URL
   ========================================================= */

function API_BASE_FOR_PDF(
    sl,
    tl,
    text
) {

    return (

        "/api/?" +

        "sl=" +
        encodeURIComponent(sl) +

        "&tl=" +
        encodeURIComponent(tl) +

        "&q=" +
        encodeURIComponent(text)

    );

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


    if (
        !data
    ) {

        return "";

    }


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
            typeof data[key] ===
            "string"
        ) {

            return data[key].trim();

        }

    }


    if (
        data.data
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

            return pdfExtractTranslation(
                data.data
            );

        }

    }


    if (
        Array.isArray(data)
    ) {

        if (
            data.length
        ) {

            return pdfExtractTranslation(
                data[0]
            );

        }

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
            "Background sampling error:",
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
       Background.
    */

    const bg =
        pdfGetBackgroundColor(
            canvas,
            line
        );


    /*
       Small padding.
    */

    const padding =
        Math.max(
            1,
            height * 0.10
        );


    /*
       Cover original text.
    */

    pdf.setFillColor(

        bg.r,
        bg.g,
        bg.b

    );


    pdf.rect(

        Math.max(
            0,
            x - padding
        ),

        Math.max(
            0,
            y - padding
        ),

        Math.min(
            width +
            padding * 2,

            pageWidth -
            Math.max(
                0,
                x - padding
            )

        ),

        Math.min(
            height +
            padding * 2,

            pageHeight -
            Math.max(
                0,
                y - padding
            )

        ),

        "F"

    );


    /*
       Font size.
    */

    let fontSize =
        Math.max(
            5,
            Math.min(
                30,
                height * 0.70
            )
        );


    /*
       Long translation -> smaller font.
    */

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
       Wrap.
    */

    const availableWidth =
        Math.max(
            10,
            width -
            padding * 2
        );


    let wrapped =
        pdf.splitTextToSize(

            translated,

            availableWidth

        );


    /*
       Maximum 3 lines.
    */

    wrapped =
        wrapped.slice(
            0,
            3
        );


    /*
       Position.
    */

    const textX =
        x + padding;


    const textY =
        y +
        Math.max(
            fontSize,
            height * 0.78
        );


    pdf.text(

        wrapped,

        textX,

        textY,

        {

            maxWidth:
                availableWidth

        }

    );

}


/* =========================================================
   CREATE OUTPUT PDF
   ========================================================= */

function pdfCreateOutputDocument(
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
   PROCESS PDF
   ========================================================= */

async function pdfProcessFile(
    file
) {

    pdfClearError();


    pdfCheckLibraries();


    console.log(
        "Processing file:",
        file.name
    );


    /*
       Show immediate feedback.
    */

    pdfSetStatus(

        `📥 Selected: ${file.name}`

    );


    pdfSetProgress(
        2
    );


    /*
       Load PDF.
    */

    const pdf =
        await pdfLoadDocument(
            file
        );


    const totalPages =
        pdf.numPages;


    pdfSetStatus(

        `📄 PDF loaded — ${totalPages} page${totalPages === 1 ? "" : "s"}`

    );


    /*
       First page determines page size.
    */

    const firstPage =
        await pdf.getPage(
            1
        );


    const firstViewport =
        firstPage.getViewport({

            scale: 1

        });


    const pageWidth =
        firstViewport.width;


    const pageHeight =
        firstViewport.height;


    /*
       Create output PDF.
    */

    const outputPdf =
        pdfCreateOutputDocument(

            pageWidth,

            pageHeight

        );


    /*
       Create ONE OCR worker for the whole PDF.
    */

    const worker =
        await pdfCreateOCRWorker();


    try {

        /*
           Process each page.
        */

        for (
            let pageNumber = 1;
            pageNumber <= totalPages;
            pageNumber++
        ) {

            console.log(
                "Processing page:",
                pageNumber
            );


            /*
               Get page.
            */

            const page =
                await pdf.getPage(
                    pageNumber
                );


            /*
               Page size.
            */

            const viewport =
                page.getViewport({

                    scale: 1

                });


            const currentWidth =
                viewport.width;


            const currentHeight =
                viewport.height;


            /*
               New page except first.
            */

            if (
                pageNumber > 1
            ) {

                outputPdf.addPage(

                    [
                        currentWidth,
                        currentHeight
                    ]

                );

            }


            /*
               Render.
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
               OCR.
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

                `Page ${pageNumber}: ${lines.length} OCR lines`

            );


            /*
               Add original page FIRST.

               This preserves the complete original
               visual layout.
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

                currentWidth,

                currentHeight,

                undefined,

                "FAST"

            );


            /*
               Translate OCR lines.
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

                    `🌎 Translating page ${pageNumber}/${totalPages} — ` +
                    `${i + 1}/${lines.length}`

                );


                let translated;


                try {

                    translated =
                        await pdfTranslateText(
                            line.text
                        );


                } catch (
                    error
                ) {

                    console.warn(

                        "Translation failed:",
                        line.text,
                        error

                    );


                    /*
                       Keep original OCR text if
                       individual API request fails.
                    */

                    translated =
                        line.text;

                }


                if (
                    !translated
                ) {

                    translated =
                        line.text;

                }


                translatedLines.push({

                    ...line,

                    translated

                });


                /*
                   Progress.
                */

                const progress =
                    10 +
                    (
                        (
                            (
                                pageNumber -
                                1
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
                    85;


                pdfSetProgress(
                    progress
                );


                /*
                   Allow browser UI to refresh.
                */

                await new Promise(
                    resolve =>
                        setTimeout(
                            resolve,
                            2
                        )
                );

            }


            /*
               Overlay translations.
            */

            pdfSetStatus(

                `✏️ Applying translation to page ${pageNumber}...`

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

                    currentWidth,

                    currentHeight

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
           Always terminate worker.
        */

        try {

            await worker.terminate();

        } catch (
            error
        ) {

            console.warn(
                "Could not terminate OCR worker:",
                error
            );

        }

    }


    /*
       Metadata.
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
        error
    ) {

        console.warn(
            "PDF metadata error:",
            error
        );

    }


    /*
       Filename.
    */

    const baseName =
        file.name.replace(
            /\.pdf$/i,
            ""
        );


    const outputName =
        "translated_" +
        baseName +
        ".pdf";


    /*
       Save.
    */

    pdfSetStatus(
        "💾 Creating translated PDF..."
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


    if (
        pdfTranslationStatus
    ) {

        pdfTranslationStatus.textContent =
            "PDF translation completed.";

    }


    console.log(
        "PDF processing completed:",
        outputName
    );

}


/* =========================================================
   FILE SELECT EVENT
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


            if (
                !file
            ) {

                console.warn(
                    "No file selected."
                );

                return;

            }


            console.log(
                "FILE:",
                file
            );


            console.log(
                "NAME:",
                file.name
            );


            console.log(
                "TYPE:",
                file.type
            );


            console.log(
                "SIZE:",
                file.size
            );


            /*
               Immediate visible response.
            */

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


                pdfShowError(

                    error &&
                    error.message
                        ? error.message
                        : "Unknown PDF processing error."

                );

            } finally {

                /*
                   Allow selecting the same file again.
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
   FINAL DIAGNOSTICS
   ========================================================= */

console.log(
    "PDF input:",
    pdfInput
);

console.log(
    "PDF.js:",
    typeof pdfjsLib !== "undefined"
        ? "READY"
        : "MISSING"
);

console.log(
    "Tesseract:",
    typeof Tesseract !== "undefined"
        ? "READY"
        : "MISSING"
);

console.log(
    "jsPDF:",
    typeof window.jspdf !== "undefined" &&
    typeof window.jspdf.jsPDF === "function"
        ? "READY"
        : "MISSING"
);

console.log(
    "Dhiren Translate PDF module ready."
);

console.log(
    "===================================="
);
