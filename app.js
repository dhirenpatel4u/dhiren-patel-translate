"use strict";


/*
 * =========================================================
 * Dhiren Translate
 * =========================================================
 *
 * Translation API:
 *
 * /api/?sl=en&tl=hi&q=Hello
 *
 * OCR:
 *
 * Camera / Image
 *       ↓
 * Tesseract.js
 *       ↓
 * Extracted text
 *       ↓
 * sourceText
 *
 * =========================================================
 */


const API_URL = "/api/";



/*
 * =========================================================
 * SUPPORTED LANGUAGES
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
 * DOM ELEMENTS
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
 * OCR elements.
 */

const cameraInput =
    document.getElementById("cameraInput");


const imageInput =
    document.getElementById("imageInput");


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



/*
 * =========================================================
 * LANGUAGE OPTIONS
 * =========================================================
 */

function populateLanguages() {

    sourceLanguage.innerHTML = "";

    targetLanguage.innerHTML = "";


    /*
     * Detect language option.
     */

    const detectOption =
        document.createElement("option");


    detectOption.value =
        "auto";


    detectOption.textContent =
        "Detect language";


    sourceLanguage.appendChild(
        detectOption
    );


    /*
     * Add languages.
     */

    LANGUAGES.forEach(
        ([code, name]) => {


            const sourceOption =
                document.createElement(
                    "option"
                );


            sourceOption.value =
                code;


            sourceOption.textContent =
                name;


            sourceLanguage.appendChild(
                sourceOption
            );



            const targetOption =
                document.createElement(
                    "option"
                );


            targetOption.value =
                code;


            targetOption.textContent =
                name;


            targetLanguage.appendChild(
                targetOption
            );

        }
    );


    sourceLanguage.value =
        "auto";


    targetLanguage.value =
        "en";

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
 * ERRORS
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
 * TRANSLATION LOADING
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
 * TRANSLATION RESPONSE
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


        /*
         * Same language.
         */

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


        /*
         * API parameters.
         */

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


        /*
         * API request.
         */

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
 * LANGUAGE SWAP
 * =========================================================
 */

function swapLanguages() {

    /*
     * Cannot swap when source is Auto.
     */

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


    /*
     * Swap text and translation.
     */

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


    /*
     * Clear selected image files.
     */

    if (cameraInput) {
        cameraInput.value = "";
    }


    if (imageInput) {
        imageInput.value = "";
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
            () => {

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
 *
 * Translation language codes are not always
 * the same as Tesseract language codes.
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

    const selectedLanguage =
        sourceLanguage.value;


    /*
     * When Detect Language is selected,
     * use English + Hindi + Gujarati.
     *
     * These are useful for common Indian
     * multilingual images.
     */

    if (
        selectedLanguage ===
        "auto"
    ) {

        return "eng+hin+guj";

    }


    return (
        OCR_LANGUAGES[
            selectedLanguage
        ] || "eng"
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
 * RUN OCR
 * =========================================================
 */

async function runOCR(file) {

    if (!file) {
        return;
    }


    /*
     * Make sure the selected file is an image.
     */

    if (
        !file.type ||
        !file.type.startsWith("image/")
    ) {

        showOCRStatus(
            "Please select an image file."
        );


        return;

    }


    /*
     * Make sure Tesseract loaded.
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


    try {

        showOCRProgress();


        showOCRStatus(
            "Preparing OCR…"
        );


        /*
         * Get OCR language.
         */

        const language =
            getOCRLanguage();


        /*
         * Create OCR worker.
         */

        const worker =
            await Tesseract.createWorker(
                language,
                1,
                {

                    logger:
                        function (message) {

                            /*
                             * Progress.
                             */

                            if (
                                typeof message.progress ===
                                "number"
                            ) {

                                setOCRProgress(
                                    message.progress *
                                    100
                                );

                            }


                            /*
                             * Status.
                             */

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


        showOCRStatus(
            "🔎 Reading text from image…"
        );


        /*
         * OCR.
         */

        const result =
            await worker.recognize(
                file
            );


        /*
         * Close worker.
         */

        await worker.terminate();


        /*
         * Extract text.
         */

        const extractedText =
            result.data.text.trim();


        /*
         * No text.
         */

        if (!extractedText) {

            hideOCRProgress();


            showOCRStatus(
                "⚠️ No text was found in this image."
            );


            return;

        }


        /*
         * Put OCR result into
         * the existing translation input.
         */

        sourceText.value =
            extractedText;


        /*
         * Update character count.
         */

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


        /*
         * Clear previous errors.
         */

        hideError();


        /*
         * Finish.
         */

        setOCRProgress(100);


        showOCRStatus(
            "✅ Text extracted successfully!"
        );


        /*
         * Focus source text.
         */

        sourceText.focus();


        /*
         * Hide OCR status after 2 seconds.
         */

        setTimeout(
            function () {

                hideOCRStatus();

                hideOCRProgress();

            },
            2000
        );


    } catch (error) {

        console.error(
            "OCR Error:",
            error
        );


        hideOCRProgress();


        showOCRStatus(
            "❌ OCR failed. Please try another image."
        );

    }

}



/*
 * =========================================================
 * CAMERA EVENT
 * =========================================================
 */

if (cameraInput) {

    cameraInput.addEventListener(
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
             * Allow the same image
             * to be selected again.
             */

            this.value = "";

        }
    );

}



/*
 * =========================================================
 * IMAGE / GALLERY EVENT
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
             * Allow same image
             * to be selected again.
             */

            this.value = "";

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
 * Ctrl + Enter / Cmd + Enter
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
 * Target language change.
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
 * Source language change.
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
