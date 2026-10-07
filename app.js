"use strict";


/*
 * =========================================================
 * DHIREN TRANSLATE
 * =========================================================
 *
 * Translation API:
 *
 * /api/?sl=en&tl=hi&q=Hello
 *
 * Image OCR:
 *
 * Image
 *   ↓
 * Image preprocessing
 *   ↓
 * Multiple Tesseract OCR passes
 *   ↓
 * Table/border cleanup
 *   ↓
 * Confidence filtering
 *   ↓
 * Symbol protection
 *   ↓
 * Clean OCR text
 *   ↓
 * sourceText
 *
 * =========================================================
 */


const API_URL = "/api/";


/*
 * =========================================================
 * LANGUAGES
 * =========================================================
 */

const LANGUAGES = [

    ["af", "Afrikaans"],
    ["sq", "Albanian"],
    ["am", "Amharic"],
    ["ar", "Arabic"],
    ["hy", "Armenian"],
    ["as", "Assamese"],
    ["ay", "Aymara"],
    ["az", "Azerbaijani"],
    ["eu", "Basque"],
    ["be", "Belarusian"],
    ["bn", "Bengali"],
    ["bs", "Bosnian"],
    ["bg", "Bulgarian"],
    ["ca", "Catalan"],
    ["ceb", "Cebuano"],
    ["ny", "Chichewa"],
    ["zh-CN", "Chinese (Simplified)"],
    ["zh-TW", "Chinese (Traditional)"],
    ["co", "Corsican"],
    ["hr", "Croatian"],
    ["cs", "Czech"],
    ["da", "Danish"],
    ["dv", "Dhivehi"],
    ["doi", "Dogri"],
    ["nl", "Dutch"],
    ["en", "English"],
    ["eo", "Esperanto"],
    ["et", "Estonian"],
    ["ee", "Ewe"],
    ["tl", "Filipino"],
    ["fi", "Finnish"],
    ["fr", "French"],
    ["fy", "Frisian"],
    ["gl", "Galician"],
    ["ka", "Georgian"],
    ["de", "German"],
    ["el", "Greek"],
    ["gn", "Guarani"],
    ["gu", "Gujarati"],
    ["ht", "Haitian Creole"],
    ["ha", "Hausa"],
    ["haw", "Hawaiian"],
    ["he", "Hebrew"],
    ["hi", "Hindi"],
    ["hmn", "Hmong"],
    ["hu", "Hungarian"],
    ["is", "Icelandic"],
    ["ig", "Igbo"],
    ["ilo", "Ilocano"],
    ["id", "Indonesian"],
    ["ga", "Irish"],
    ["it", "Italian"],
    ["ja", "Japanese"],
    ["jv", "Javanese"],
    ["kn", "Kannada"],
    ["kk", "Kazakh"],
    ["km", "Khmer"],
    ["rw", "Kinyarwanda"],
    ["gom", "Konkani"],
    ["ko", "Korean"],
    ["kri", "Krio"],
    ["ku", "Kurdish"],
    ["ky", "Kyrgyz"],
    ["lo", "Lao"],
    ["la", "Latin"],
    ["lv", "Latvian"],
    ["ln", "Lingala"],
    ["lt", "Lithuanian"],
    ["lg", "Luganda"],
    ["lb", "Luxembourgish"],
    ["mk", "Macedonian"],
    ["mai", "Maithili"],
    ["mg", "Malagasy"],
    ["ms", "Malay"],
    ["ml", "Malayalam"],
    ["mt", "Maltese"],
    ["mi", "Maori"],
    ["mr", "Marathi"],
    ["mni-Mtei", "Meiteilon (Manipuri)"],
    ["lus", "Mizo"],
    ["mn", "Mongolian"],
    ["my", "Myanmar (Burmese)"],
    ["ne", "Nepali"],
    ["no", "Norwegian"],
    ["or", "Odia"],
    ["om", "Oromo"],
    ["ps", "Pashto"],
    ["fa", "Persian"],
    ["pl", "Polish"],
    ["pt", "Portuguese"],
    ["pa", "Punjabi"],
    ["qu", "Quechua"],
    ["ro", "Romanian"],
    ["ru", "Russian"],
    ["sm", "Samoan"],
    ["sa", "Sanskrit"],
    ["gd", "Scots Gaelic"],
    ["nso", "Sepedi"],
    ["sr", "Serbian"],
    ["st", "Sesotho"],
    ["sn", "Shona"],
    ["sd", "Sindhi"],
    ["si", "Sinhala"],
    ["sk", "Slovak"],
    ["sl", "Slovenian"],
    ["so", "Somali"],
    ["es", "Spanish"],
    ["su", "Sundanese"],
    ["sw", "Swahili"],
    ["sv", "Swedish"],
    ["tg", "Tajik"],
    ["ta", "Tamil"],
    ["tt", "Tatar"],
    ["te", "Telugu"],
    ["th", "Thai"],
    ["ti", "Tigrinya"],
    ["ts", "Tsonga"],
    ["tr", "Turkish"],
    ["tk", "Turkmen"],
    ["uk", "Ukrainian"],
    ["ur", "Urdu"],
    ["ug", "Uyghur"],
    ["uz", "Uzbek"],
    ["vi", "Vietnamese"],
    ["cy", "Welsh"],
    ["xh", "Xhosa"],
    ["yi", "Yiddish"],
    ["yo", "Yoruba"],
    ["zu", "Zulu"]

];


/*
 * =========================================================
 * DOM
 * =========================================================
 */

const sourceLanguage =
    document.getElementById("sourceLanguage");

const targetLanguage =
    document.getElementById("targetLanguage");

const sourceText =
    document.getElementById("sourceText");

const translationResult =
    document.getElementById("translationResult");

const translateButton =
    document.getElementById("translateButton");

const translateButtonText =
    document.getElementById("translateButtonText");

const translateSpinner =
    document.getElementById("translateSpinner");

const swapButton =
    document.getElementById("swapButton");

const clearButton =
    document.getElementById("clearButton");

const copyButton =
    document.getElementById("copyButton");

const characterCount =
    document.getElementById("characterCount");

const translationStatus =
    document.getElementById("translationStatus");

const errorMessage =
    document.getElementById("errorMessage");

const mobileMenuButton =
    document.getElementById("mobileMenuButton");

const mobileNav =
    document.getElementById("mobileNav");


/*
 * OCR DOM
 */

const imageInput =
    document.getElementById("imageInput");

const ocrStatus =
    document.getElementById("ocrStatus");

const ocrProgressContainer =
    document.getElementById("ocrProgressContainer");

const ocrProgress =
    document.getElementById("ocrProgress");


/*
 * =========================================================
 * POPULATE LANGUAGES
 * =========================================================
 */

function populateLanguages() {

    sourceLanguage.innerHTML = "";
    targetLanguage.innerHTML = "";

    const detectOption =
        document.createElement("option");

    detectOption.value = "auto";
    detectOption.textContent = "Detect language";

    sourceLanguage.appendChild(
        detectOption
    );

    LANGUAGES.forEach(
        ([code, name]) => {

            const sourceOption =
                document.createElement("option");

            sourceOption.value = code;
            sourceOption.textContent = name;

            sourceLanguage.appendChild(
                sourceOption
            );


            const targetOption =
                document.createElement("option");

            targetOption.value = code;
            targetOption.textContent = name;

            targetLanguage.appendChild(
                targetOption
            );

        }
    );

    sourceLanguage.value = "auto";
    targetLanguage.value = "en";

}


/*
 * =========================================================
 * CHARACTER COUNT
 * =========================================================
 */

function updateCharacterCount() {

    characterCount.textContent =
        `${sourceText.value.length} / 5000`;

}


/*
 * =========================================================
 * ERROR
 * =========================================================
 */

function showError(message) {

    errorMessage.textContent =
        message;

    errorMessage.classList.remove(
        "hidden"
    );

}


function hideError() {

    errorMessage.textContent =
        "";

    errorMessage.classList.add(
        "hidden"
    );

}


/*
 * =========================================================
 * LOADING
 * =========================================================
 */

function setLoading(isLoading) {

    translateButton.disabled =
        isLoading;

    if (isLoading) {

        translateButtonText.textContent =
            "Translating";

        translateSpinner.classList.remove(
            "hidden"
        );

    } else {

        translateButtonText.textContent =
            "Translate";

        translateSpinner.classList.add(
            "hidden"
        );

    }

}


/*
 * =========================================================
 * API RESULT
 * =========================================================
 */

function getTranslation(data) {

    if (!data) {
        return "";
    }

    if (
        typeof data === "string"
    ) {
        return data;
    }

    if (
        typeof data.result === "string"
    ) {
        return data.result;
    }

    if (
        typeof data.translation === "string"
    ) {
        return data.translation;
    }

    if (
        typeof data.translatedText === "string"
    ) {
        return data.translatedText;
    }

    if (
        typeof data.text === "string"
    ) {
        return data.text;
    }

    return "";

}


/*
 * =========================================================
 * TRANSLATE
 * =========================================================
 */

async function translate() {

    const text =
        sourceText.value.trim();

    if (!text) {

        translationResult.textContent =
            "Translation";

        translationResult.classList.remove(
            "has-result"
        );

        hideError();

        return;

    }

    hideError();

    setLoading(true);

    translationStatus.textContent =
        "Translating…";

    try {

        const source =
            sourceLanguage.value;

        const target =
            targetLanguage.value;


        if (
            source !== "auto" &&
            source === target
        ) {

            translationResult.textContent =
                text;

            translationResult.classList.add(
                "has-result"
            );

            translationStatus.textContent =
                "Same language";

            return;

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
            text
        );


        const response =
            await fetch(
                `${API_URL}?${params.toString()}`,
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
                `API returned HTTP ${response.status}`
            );

        }


        const data =
            await response.json();

        const result =
            getTranslation(data);


        if (!result) {

            throw new Error(
                "The API did not return a translation."
            );

        }


        translationResult.textContent =
            result;

        translationResult.classList.add(
            "has-result"
        );

        translationStatus.textContent =
            "Translated";


    } catch (error) {

        console.error(error);

        translationResult.textContent =
            "Translation";

        translationResult.classList.remove(
            "has-result"
        );

        translationStatus.textContent =
            "";

        showError(
            "Unable to translate right now. Please check the API and try again."
        );

    } finally {

        setLoading(false);

    }

}


/*
 * =========================================================
 * SWAP
 * =========================================================
 */

function swapLanguages() {

    if (
        sourceLanguage.value ===
        "auto"
    ) {

        return;

    }


    const oldSource =
        sourceLanguage.value;

    const oldTarget =
        targetLanguage.value;

    sourceLanguage.value =
        oldTarget;

    targetLanguage.value =
        oldSource;


    if (
        sourceText.value.trim() &&
        translationResult.classList.contains(
            "has-result"
        )
    ) {

        const oldText =
            sourceText.value;

        sourceText.value =
            translationResult.textContent;

        translationResult.textContent =
            oldText;

        updateCharacterCount();

    }

}


/*
 * =========================================================
 * CLEAR
 * =========================================================
 */

function clearTranslation() {

    sourceText.value =
        "";

    translationResult.textContent =
        "Translation";

    translationResult.classList.remove(
        "has-result"
    );

    translationStatus.textContent =
        "";

    hideError();

    updateCharacterCount();


    if (imageInput) {

        imageInput.value =
            "";

    }


    hideOCRStatus();
    hideOCRProgress();

    sourceText.focus();

}


/*
 * =========================================================
 * COPY
 * =========================================================
 */

async function copyTranslation() {

    const result =
        translationResult.textContent.trim();

    if (
        !result ||
        result === "Translation"
    ) {

        return;

    }


    try {

        await navigator.clipboard.writeText(
            result
        );

        translationStatus.textContent =
            "Copied!";


        setTimeout(
            function () {

                if (
                    translationStatus.textContent ===
                    "Copied!"
                ) {

                    translationStatus.textContent =
                        "Translated";

                }

            },
            1500
        );


    } catch (error) {

        console.error(error);

        showError(
            "Unable to copy the translation."
        );

    }

}


/*
 * =========================================================
 * OCR LANGUAGE MAP
 * =========================================================
 */

const OCR_LANGUAGES = {

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

function getOCRLanguage() {

    const language =
        sourceLanguage.value;


    if (
        language === "auto"
    ) {

        return "eng+hin+guj";

    }


    return (
        OCR_LANGUAGES[language] ||
        "eng"
    );

}


/*
 * =========================================================
 * OCR STATUS
 * =========================================================
 */

function showOCRStatus(message) {

    if (!ocrStatus) {
        return;
    }

    ocrStatus.textContent =
        message;

    ocrStatus.classList.remove(
        "hidden"
    );

}


function hideOCRStatus() {

    if (!ocrStatus) {
        return;
    }

    ocrStatus.textContent =
        "";

    ocrStatus.classList.add(
        "hidden"
    );

}


/*
 * =========================================================
 * OCR PROGRESS
 * =========================================================
 */

function setOCRProgress(value) {

    if (!ocrProgress) {
        return;
    }

    const percent =
        Math.max(
            0,
            Math.min(
                100,
                value
            )
        );

    ocrProgress.style.width =
        `${percent}%`;

}


function showOCRProgress() {

    if (!ocrProgressContainer) {
        return;
    }

    ocrProgressContainer.classList.remove(
        "hidden"
    );

    setOCRProgress(0);

}


function hideOCRProgress() {

    if (!ocrProgressContainer) {
        return;
    }

    ocrProgressContainer.classList.add(
        "hidden"
    );

    setOCRProgress(0);

}


/*
 * =========================================================
 * IMAGE LOADING
 * =========================================================
 */

function loadImageFromFile(file) {

    return new Promise(
        function (resolve, reject) {

            const image =
                new Image();

            const objectURL =
                URL.createObjectURL(file);


            image.onload =
                function () {

                    URL.revokeObjectURL(
                        objectURL
                    );

                    resolve(image);

                };


            image.onerror =
                function () {

                    URL.revokeObjectURL(
                        objectURL
                    );

                    reject(
                        new Error(
                            "Unable to read image."
                        )
                    );

                };


            image.src =
                objectURL;

        }
    );

}


/*
 * =========================================================
 * OCR CANVAS HELPERS
 * =========================================================
 */

function clamp(value, min, max) {

    return Math.max(
        min,
        Math.min(
            max,
            value
        )
    );

}


/*
 * Determine a practical OCR scale.
 *
 * Tesseract performs much better when small text is enlarged.
 * We avoid excessive enlargement because huge canvas sizes
 * consume a lot of browser memory.
 */

function getOCRScale(width, height) {

    const longest =
        Math.max(
            width,
            height
        );


    if (longest < 1200) {
        return 2.4;
    }

    if (longest < 1800) {
        return 1.9;
    }

    if (longest < 2600) {
        return 1.5;
    }

    if (longest < 4000) {
        return 1.15;
    }

    return 1;
}


/*
 * Convert image to grayscale and improve contrast.
 */

function applyGrayscaleContrast(
    imageData,
    contrastAmount
) {

    const data =
        imageData.data;

    const factor =
        (259 *
            (
                contrastAmount +
                255
            )
        ) /
        (
            255 *
            (
                259 -
                contrastAmount
            )
        );


    for (
        let i = 0;
        i < data.length;
        i += 4
    ) {

        const r =
            data[i];

        const g =
            data[i + 1];

        const b =
            data[i + 2];


        /*
         * Luminance.
         */
        let gray =
            (
                0.299 * r +
                0.587 * g +
                0.114 * b
            );


        /*
         * Contrast.
         */
        gray =
            factor *
            (
                gray - 128
            ) +
            128;


        gray =
            clamp(
                gray,
                0,
                255
            );


        data[i] =
            gray;

        data[i + 1] =
            gray;

        data[i + 2] =
            gray;

    }

}


/*
 * Estimate a threshold using image brightness.
 *
 * This is intentionally conservative. A fixed threshold can
 * destroy Gujarati strokes on photographs.
 */

function calculateAdaptiveThreshold(
    imageData
) {

    const data =
        imageData.data;

    let sum =
        0;

    let count =
        0;


    /*
     * Sample pixels instead of scanning every pixel.
     */
    const step =
        4 * 4;


    for (
        let i = 0;
        i < data.length;
        i += step
    ) {

        sum +=
            data[i];

        count++;

    }


    const mean =
        count
            ? sum / count
            : 128;


    return clamp(
        mean - 10,
        80,
        210
    );

}


/*
 * Remove long horizontal/vertical lines.
 *
 * This is specifically aimed at Excel tables and forms.
 *
 * Important:
 * We only remove pixels belonging to long continuous lines.
 * We do NOT remove every "-" or "/" character from OCR output.
 */

function removeTableLines(
    canvas
) {

    const ctx =
        canvas.getContext(
            "2d",
            {
                willReadFrequently: true
            }
        );


    const width =
        canvas.width;

    const height =
        canvas.height;


    if (
        width < 100 ||
        height < 100
    ) {

        return canvas;

    }


    const imageData =
        ctx.getImageData(
            0,
            0,
            width,
            height
        );


    const data =
        imageData.data;


    /*
     * Work on a binary representation.
     */
    const dark =
        new Uint8Array(
            width * height
        );


    for (
        let y = 0;
        y < height;
        y++
    ) {

        for (
            let x = 0;
            x < width;
            x++
        ) {

            const index =
                (
                    y * width +
                    x
                ) * 4;


            const value =
                data[index];


            dark[
                y * width + x
            ] =
                value < 145
                    ? 1
                    : 0;

        }

    }


    /*
     * Long horizontal line detection.
     */
    const horizontalMin =
        Math.max(
            80,
            Math.floor(
                width * 0.18
            )
        );


    for (
        let y = 0;
        y < height;
        y++
    ) {

        let runStart =
            -1;

        for (
            let x = 0;
            x <= width;
            x++
        ) {

            const isDark =
                x < width &&
                dark[
                    y * width + x
                ];


            if (isDark) {

                if (runStart === -1) {
                    runStart = x;
                }

            } else {

                if (runStart !== -1) {

                    const length =
                        x - runStart;


                    if (
                        length >=
                        horizontalMin
                    ) {

                        /*
                         * Remove the line.
                         */
                        for (
                            let xx =
                                runStart;
                            xx < x;
                            xx++
                        ) {

                            const p =
                                (
                                    y *
                                    width +
                                    xx
                                ) * 4;

                            data[p] =
                                255;

                            data[p + 1] =
                                255;

                            data[p + 2] =
                                255;

                            data[p + 3] =
                                255;

                        }

                    }

                }

                runStart = -1;

            }

        }

    }


    /*
     * Long vertical line detection.
     */
    const verticalMin =
        Math.max(
            80,
            Math.floor(
                height * 0.18
            )
        );


    for (
        let x = 0;
        x < width;
        x++
    ) {

        let runStart =
            -1;


        for (
            let y = 0;
            y <= height;
            y++
        ) {

            const isDark =
                y < height &&
                dark[
                    y * width + x
                ];


            if (isDark) {

                if (runStart === -1) {
                    runStart = y;
                }

            } else {

                if (runStart !== -1) {

                    const length =
                        y - runStart;


                    if (
                        length >=
                        verticalMin
                    ) {

                        for (
                            let yy =
                                runStart;
                            yy < y;
                            yy++
                        ) {

                            const p =
                                (
                                    yy *
                                    width +
                                    x
                                ) * 4;

                            data[p] =
                                255;

                            data[p + 1] =
                                255;

                            data[p + 2] =
                                255;

                            data[p + 3] =
                                255;

                        }

                    }

                }

                runStart = -1;

            }

        }

    }


    ctx.putImageData(
        imageData,
        0,
        0
    );


    return canvas;

}


/*
 * Create an OCR-ready canvas.
 */

function createOCRCanvas(
    image,
    options = {}
) {

    const originalWidth =
        image.naturalWidth ||
        image.width;

    const originalHeight =
        image.naturalHeight ||
        image.height;


    const scale =
        getOCRScale(
            originalWidth,
            originalHeight
        );


    const maxCanvasSize =
        7000;


    let width =
        Math.round(
            originalWidth *
            scale
        );

    let height =
        Math.round(
            originalHeight *
            scale
        );


    /*
     * Prevent browser memory problems.
     */
    if (
        width > maxCanvasSize ||
        height > maxCanvasSize
    ) {

        const reduction =
            Math.min(
                maxCanvasSize / width,
                maxCanvasSize / height
            );

        width =
            Math.max(
                100,
                Math.round(
                    width *
                    reduction
                )
            );

        height =
            Math.max(
                100,
                Math.round(
                    height *
                    reduction
                )
            );

    }


    const canvas =
        document.createElement(
            "canvas"
        );


    canvas.width =
        width;

    canvas.height =
        height;


    const ctx =
        canvas.getContext(
            "2d",
            {
                willReadFrequently: true
            }
        );


    /*
     * White background.
     *
     * This prevents transparent PNG backgrounds from creating
     * strange OCR results.
     */
    ctx.fillStyle =
        "#ffffff";

    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    ctx.imageSmoothingEnabled =
        true;

    ctx.imageSmoothingQuality =
        "high";


    ctx.drawImage(
        image,
        0,
        0,
        width,
        height
    );


    const imageData =
        ctx.getImageData(
            0,
            0,
            width,
            height
        );


    /*
     * Grayscale + contrast.
     */
    applyGrayscaleContrast(
        imageData,
        options.contrast
            ? 28
            : 8
    );


    /*
     * Threshold.
     */
    if (
        options.threshold
    ) {

        const threshold =
            calculateAdaptiveThreshold(
                imageData
            );


        const data =
            imageData.data;


        for (
            let i = 0;
            i < data.length;
            i += 4
        ) {

            const value =
                data[i];


            const output =
                value <
                threshold
                    ? 0
                    : 255;


            data[i] =
                output;

            data[i + 1] =
                output;

            data[i + 2] =
                output;

        }

    }


    ctx.putImageData(
        imageData,
        0,
        0
    );


    /*
     * Table border cleanup is deliberately performed AFTER
     * preprocessing.
     */
    if (
        options.removeLines
    ) {

        removeTableLines(
            canvas
        );

    }


    return canvas;

}


/*
 * =========================================================
 * OCR TEXT CLEANING
 * =========================================================
 */


/*
 * Normalize symbols that OCR frequently returns in full-width
 * or visually similar forms.
 */

function normalizeOCRSymbols(
    text
) {

    const replacements = {

        "＄": "$",
        "＃": "#",
        "％": "%",
        "＆": "&",
        "＠": "@",
        "＋": "+",
        "＝": "=",
        "－": "-",
        "／": "/",
        "＼": "\\",
        "＊": "*",
        "：": ":",
        "；": ";",
        "，": ",",
        "．": ".",
        "！": "!",
        "？": "?",
        "（": "(",
        "）": ")",
        "［": "[",
        "］": "]",
        "｛": "{",
        "｝": "}",
        "＜": "<",
        "＞": ">",
        "｜": "|",
        "＾": "^",
        "～": "~"

    };


    return text.replace(
        /[＄＃％＆＠＋＝－／＼＊：；，．！？（）［］｛｝＜＞｜＾～]/g,
        function (character) {

            return (
                replacements[
                    character
                ] ||
                character
            );

        }
    );

}


/*
 * Remove characters that are definitely not useful for OCR.
 *
 * IMPORTANT:
 *
 * We intentionally allow:
 *
 * English
 * Gujarati
 * Hindi
 * Numbers
 * Currency
 * Mathematical symbols
 * Punctuation
 *
 * We do NOT use a "Gujarati only" regex because that would
 * destroy invoice numbers, English names and symbols.
 */

function removeOCRGarbage(
    text
) {

    let result =
        text;


    /*
     * Remove zero-width/control characters.
     */
    result =
        result.replace(
            /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,
            ""
        );


    /*
     * Keep normal Unicode text but remove replacement
     * characters produced by broken decoding.
     */
    result =
        result.replace(
            /\uFFFD/g,
            ""
        );


    /*
     * Remove a few characters that Tesseract can output when
     * it sees borders/noise.
     *
     * We do NOT remove normal punctuation.
     */
    result =
        result.replace(
            /[¦¤]/g,
            ""
        );


    /*
     * Collapse excessive spaces.
     */
    result =
        result.replace(
            /[ \t]{2,}/g,
            " "
        );


    /*
     * Clean spaces immediately before punctuation.
     */
    result =
        result.replace(
            /[ \t]+([,.;:!?%$#&])/g,
            "$1"
        );


    /*
     * Clean repeated empty lines.
     */
    result =
        result.replace(
            /\n[ \t]*\n[ \t]*\n+/g,
            "\n\n"
        );


    /*
     * Remove spaces on blank lines.
     */
    result =
        result.replace(
            /^[ \t]+$/gm,
            ""
        );


    return result;

}


/*
 * Detect whether a line contains meaningful text.
 *
 * Gujarati range:
 * U+0A80–U+0AFF
 *
 * Devanagari:
 * U+0900–U+097F
 *
 * Latin:
 * A-Z / a-z
 *
 * Numbers:
 * 0-9 and common Indic digits.
 */

function hasMeaningfulOCRText(
    line
) {

    if (!line) {
        return false;
    }


    const meaningful =
        line.match(
            /[A-Za-z0-9\u0900-\u097F\u0A80-\u0AFF\u0980-\u09FF\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F\u0600-\u06FF]/
        );


    if (meaningful) {
        return true;
    }


    /*
     * Symbols can be legitimate by themselves.
     *
     * Examples:
     * $
     * %
     * &
     * #
     * /
     * +91
     *
     * A line consisting only of one punctuation character is
     * usually noise, so require at least one non-space
     * character and either a repeated symbol or a number.
     */
    const symbolOnly =
        line.trim();


    if (
        /^[&/$#%@+\-=:;.,!?]+$/.test(
            symbolOnly
        )
    ) {

        return (
            symbolOnly.length >= 2
        );

    }


    return false;

}


/*
 * Remove obvious border garbage from OCR text.
 *
 * This is deliberately conservative.
 */

function removeBorderGarbage(
    text
) {

    const lines =
        text.split(/\r?\n/);


    const cleaned =
        [];


    for (
        let i = 0;
        i < lines.length;
        i++
    ) {

        let line =
            lines[i].trim();


        if (!line) {

            if (
                cleaned.length &&
                cleaned[
                    cleaned.length - 1
                ] !== ""
            ) {

                cleaned.push("");

            }

            continue;

        }


        /*
         * Lines made almost entirely from box drawing or
         * repeated border characters are not text.
         */
        if (
            /^[|¦_=\-+.:;~`'"]{3,}$/.test(
                line
            )
        ) {

            continue;

        }


        /*
         * Repeated same-character noise.
         */
        if (
            /^(.)\1{5,}$/.test(
                line
            )
        ) {

            const character =
                line[0];


            /*
             * Do not remove legitimate Gujarati/Latin text.
             * This check mostly catches lines such as
             * "||||||||" or "________".
             */
            if (
                /[|_=\-+.:;~`'"]/.test(
                    character
                )
            ) {

                continue;

            }

        }


        /*
         * If the line has no meaningful letters/numbers and is
         * only one border-like character, ignore it.
         */
        if (
            !hasMeaningfulOCRText(
                line
            )
        ) {

            continue;

        }


        cleaned.push(
            line
        );

    }


    return cleaned.join(
        "\n"
    );

}


/*
 * Main OCR cleanup.
 */

function cleanOCRText(
    text
) {

    if (!text) {
        return "";
    }


    let result =
        text;


    result =
        normalizeOCRSymbols(
            result
        );


    result =
        removeOCRGarbage(
            result
        );


    result =
        removeBorderGarbage(
            result
        );


    /*
     * Normalize line endings.
     */
    result =
        result.replace(
            /\r\n/g,
            "\n"
        );


    /*
     * Remove excessive blank lines.
     */
    result =
        result.replace(
            /\n{3,}/g,
            "\n\n"
        );


    /*
     * Trim each line while preserving line structure.
     */
    result =
        result
            .split("\n")
            .map(
                function (line) {
                    return line.trim();
                }
            )
            .join("\n");


    return result.trim();

}


/*
 * =========================================================
 * OCR CONFIDENCE / SCORING
 * =========================================================
 */


/*
 * Score an OCR candidate.
 *
 * A good OCR result normally has:
 *
 * - readable characters
 * - a reasonable confidence
 * - multiple words
 * - not too much punctuation noise
 *
 * A bad image region often produces:
 *
 * - long sequences of punctuation
 * - repeated random characters
 * - extremely low confidence
 */

function scoreOCRCandidate(
    text,
    confidence
) {

    if (!text) {
        return -Infinity;
    }


    const cleaned =
        cleanOCRText(
            text
        );


    if (!cleaned) {
        return -Infinity;
    }


    const length =
        cleaned.length;


    const letters =
        (
            cleaned.match(
                /[A-Za-z\u0900-\u097F\u0A80-\u0AFF\u0980-\u09FF]/
            ) ||
            []
        ).length;


    const numbers =
        (
            cleaned.match(
                /[0-9\u0966-\u096F\u0AE6-\u0AEF]/
            ) ||
            []
        ).length;


    const symbols =
        (
            cleaned.match(
                /[&/$#%@+\-=:;,.!?]/g
            ) ||
            []
        ).length;


    const repeatedNoise =
        (
            cleaned.match(
                /(.)\1{3,}/g
            ) ||
            []
        ).length;


    const meaningful =
        letters +
        numbers;


    let score =
        Number(confidence) || 0;


    /*
     * Reward actual text.
     */
    score +=
        Math.min(
            25,
            meaningful * 0.12
        );


    /*
     * Symbols are useful but excessive symbols usually mean
     * image/border noise.
     */
    score +=
        Math.min(
            5,
            symbols * 0.1
        );


    /*
     * Penalize repeated noise.
     */
    score -=
        repeatedNoise * 5;


    /*
     * A very short punctuation-only candidate is poor.
     */
    if (
        meaningful === 0 &&
        symbols < 2
    ) {

        score -= 30;

    }


    /*
     * Penalize extremely punctuation-heavy candidates.
     */
    if (
        length > 10 &&
        symbols >
        meaningful * 2
    ) {

        score -= 15;

    }


    return score;

}


/*
 * =========================================================
 * TESSERACT OCR PASS
 * =========================================================
 */

async function recognizeOCRImage(
    worker,
    image,
    psm,
    progressStart,
    progressEnd
) {

    /*
     * Tesseract.js 5 supports worker.setParameters().
     *
     * Preserve spaces because invoice/table text often depends
     * on spacing.
     */
    try {

        await worker.setParameters({

            tessedit_pageseg_mode:
                String(psm),

            preserve_interword_spaces:
                "1"

        });

    } catch (error) {

        /*
         * Some builds/configurations may not expose all
         * parameters. OCR can continue.
         */
        console.warn(
            "Unable to set OCR parameters:",
            error
        );

    }


    const result =
        await worker.recognize(
            image
        );


    const rawText =
        result &&
        result.data &&
        typeof result.data.text ===
        "string"
            ? result.data.text
            : "";


    const confidence =
        result &&
        result.data &&
        typeof result.data.confidence ===
        "number"
            ? result.data.confidence
            : 0;


    const cleaned =
        cleanOCRText(
            rawText
        );


    const score =
        scoreOCRCandidate(
            cleaned,
            confidence
        );


    return {

        text:
            cleaned,

        confidence:
            confidence,

        score:
            score,

        psm:
            psm

    };

}


/*
 * =========================================================
 * OCR
 * =========================================================
 */

async function runOCR(file) {

    if (!file) {
        return;
    }


    /*
     * Validate image.
     */

    if (
        !file.type ||
        !file.type.startsWith(
            "image/"
        )
    ) {

        showOCRStatus(
            "Please select an image file."
        );

        return;

    }


    /*
     * Check Tesseract.
     */

    if (
        typeof Tesseract ===
        "undefined"
    ) {

        showOCRStatus(
            "OCR library could not be loaded. Please refresh the page."
        );

        return;

    }


    let worker =
        null;


    try {

        showOCRProgress();

        showOCRStatus(
            "🖼️ Preparing image…"
        );


        /*
         * Determine OCR language.
         */
        const language =
            getOCRLanguage();


        /*
         * Load image first so we can preprocess it.
         */
        const image =
            await loadImageFromFile(
                file
            );


        const imageWidth =
            image.naturalWidth ||
            image.width;

        const imageHeight =
            image.naturalHeight ||
            image.height;


        if (
            imageWidth < 20 ||
            imageHeight < 20
        ) {

            throw new Error(
                "Image is too small."
            );

        }


        /*
         * =================================================
         * IMAGE VARIANTS
         * =================================================
         *
         * Variant 1:
         * Enhanced grayscale.
         *
         * Variant 2:
         * Adaptive binary.
         *
         * Variant 3:
         * Binary + table border cleanup.
         *
         * The original image itself is intentionally NOT
         * passed directly to OCR. Enlarged/preprocessed images
         * generally produce much cleaner OCR.
         */

        showOCRStatus(
            "🖼️ Enhancing image…"
        );


        const enhanced =
            createOCRCanvas(
                image,
                {
                    contrast:
                        true,

                    threshold:
                        false,

                    removeLines:
                        false
                }
            );


        const binary =
            createOCRCanvas(
                image,
                {
                    contrast:
                        true,

                    threshold:
                        true,

                    removeLines:
                        false
                }
            );


        const noLines =
            createOCRCanvas(
                image,
                {
                    contrast:
                        true,

                    threshold:
                        true,

                    removeLines:
                        true
                }
            );


        setOCRProgress(
            10
        );


        /*
         * =================================================
         * CREATE WORKER
         * =================================================
         */

        showOCRStatus(
            "📚 Loading OCR language…"
        );


        worker =
            await Tesseract.createWorker(
                language,
                1,
                {
                    logger:
                        function (message) {

                            if (
                                typeof message.progress ===
                                "number"
                            ) {

                                const localProgress =
                                    Math.max(
                                        0,
                                        Math.min(
                                            1,
                                            message.progress
                                        )
                                    );


                                /*
                                 * Map Tesseract progress into
                                 * 15–95%.
                                 */
                                const mapped =
                                    15 +
                                    (
                                        localProgress *
                                        80
                                    );


                                setOCRProgress(
                                    mapped
                                );

                            }


                            if (
                                message.status
                            ) {

                                showOCRStatus(
                                    `🔎 ${message.status}`
                                );

                            }

                        }

                }
            );


        const candidates =
            [];


        /*
         * =================================================
         * PASS 1
         * =================================================
         *
         * PSM 6:
         *
         * Best general-purpose mode for:
         *
         * - documents
         * - invoices
         * - Excel screenshots
         * - forms
         * - paragraphs
         */

        showOCRStatus(
            "🔎 Reading document…"
        );


        candidates.push(
            await recognizeOCRImage(
                worker,
                enhanced,
                6,
                15,
                45
            )
        );


        /*
         * =================================================
         * PASS 2
         * =================================================
         *
         * PSM 11:
         *
         * Sparse text mode.
         *
         * Useful when an image contains:
         *
         * - text around pictures
         * - labels
         * - screenshots
         * - separated text areas
         *
         * This reduces the chance of interpreting a whole
         * photograph as one giant text block.
         */

        showOCRStatus(
            "🔎 Checking separate text areas…"
        );


        candidates.push(
            await recognizeOCRImage(
                worker,
                enhanced,
                11,
                45,
                65
            )
        );


        /*
         * =================================================
         * PASS 3
         * =================================================
         *
         * Binary image.
         *
         * Useful for clean scans and screenshots.
         */

        showOCRStatus(
            "🔎 Improving scan recognition…"
        );


        candidates.push(
            await recognizeOCRImage(
                worker,
                binary,
                6,
                65,
                80
            )
        );


        /*
         * =================================================
         * PASS 4
         * =================================================
         *
         * Table-border-cleaned image.
         *
         * This is especially important for:
         *
         * - Excel screenshots
         * - tables
         * - invoices
         * - forms
         * - boxed Gujarati text
         */

        showOCRStatus(
            "📊 Cleaning table borders…"
        );


        candidates.push(
            await recognizeOCRImage(
                worker,
                noLines,
                6,
                80,
                95
            )
        );


        /*
         * =================================================
         * SELECT BEST RESULT
         * =================================================
         */

        candidates.sort(
            function (a, b) {

                return (
                    b.score -
                    a.score
                );

            }
        );


        const best =
            candidates.find(
                function (candidate) {

                    return (
                        candidate &&
                        candidate.text &&
                        candidate.text.trim()
                    );

                }
            );


        /*
         * Terminate worker.
         */

        await worker.terminate();

        worker =
            null;


        /*
         * No readable text.
         */

        if (
            !best ||
            !best.text.trim()
        ) {

            hideOCRProgress();

            showOCRStatus(
                "⚠️ No readable text found. Try a clearer image."
            );

            return;

        }


        /*
         * Final cleanup.
         */

        const extractedText =
            cleanOCRText(
                best.text
            );


        if (
            !extractedText
        ) {

            hideOCRProgress();

            showOCRStatus(
                "⚠️ No readable text found in this image."
            );

            return;

        }


        /*
         * =================================================
         * PUT OCR TEXT INTO TRANSLATION INPUT
         * =================================================
         */

        sourceText.value =
            extractedText;


        updateCharacterCount();


        /*
         * Clear old translation.
         */

        translationResult.textContent =
            "Translation";


        translationResult.classList.remove(
            "has-result"
        );


        translationStatus.textContent =
            "";


        hideError();


        setOCRProgress(
            100
        );


        showOCRStatus(
            `✅ Text extracted (${Math.round(best.confidence)}% confidence)`
        );


        sourceText.focus();


        setTimeout(
            function () {

                hideOCRStatus();

                hideOCRProgress();

            },
            2500
        );


    } catch (error) {

        console.error(
            "OCR Error:",
            error
        );


        /*
         * Clean up worker.
         */

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


        hideOCRProgress();


        showOCRStatus(
            "❌ OCR failed. Please try another image."
        );

    }

}


/*
 * =========================================================
 * IMAGE INPUT EVENT
 * =========================================================
 */

if (imageInput) {

    imageInput.addEventListener(
        "change",
        function () {

            if (
                this.files &&
                this.files.length > 0
            ) {

                runOCR(
                    this.files[0]
                );

            }


            /*
             * Reset input.
             *
             * Allows selecting the same image again.
             */

            this.value =
                "";

        }
    );

}


/*
 * =========================================================
 * EVENTS
 * =========================================================
 */

sourceText.addEventListener(
    "input",
    updateCharacterCount
);


translateButton.addEventListener(
    "click",
    translate
);


swapButton.addEventListener(
    "click",
    swapLanguages
);


clearButton.addEventListener(
    "click",
    clearTranslation
);


copyButton.addEventListener(
    "click",
    copyTranslation
);


/*
 * =========================================================
 * CTRL + ENTER / CMD + ENTER
 * =========================================================
 */

sourceText.addEventListener(
    "keydown",
    function (event) {

        if (
            (
                event.ctrlKey ||
                event.metaKey
            ) &&
            event.key === "Enter"
        ) {

            translate();

        }

    }
);


/*
 * =========================================================
 * TARGET LANGUAGE CHANGE
 * =========================================================
 */

targetLanguage.addEventListener(
    "change",
    function () {

        if (
            sourceText.value.trim()
        ) {

            translate();

        }

    }
);


/*
 * =========================================================
 * SOURCE LANGUAGE CHANGE
 * =========================================================
 */

sourceLanguage.addEventListener(
    "change",
    function () {

        if (
            sourceText.value.trim()
        ) {

            translate();

        }

    }
);


/*
 * =========================================================
 * MOBILE MENU
 * =========================================================
 */

mobileMenuButton.addEventListener(
    "click",
    function () {

        mobileNav.classList.toggle(
            "open"
        );

    }
);


/*
 * =========================================================
 * INITIALIZE
 * =========================================================
 */

populateLanguages();

updateCharacterCount();

document.getElementById(
    "year"
).textContent =
    new Date().getFullYear();
