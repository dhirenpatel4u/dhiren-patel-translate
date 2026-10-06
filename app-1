"use strict";


/*
 * Dhiren Translate
 *
 * IMPORTANT:
 * This frontend uses the existing API.
 *
 * API format:
 *
 * /api/?sl=en&tl=hi&q=Hello
 *
 * Do NOT put /api inside another API path.
 */


const API_URL = "/api/";


/*
 * Supported languages.
 *
 * The codes are the language codes normally accepted by
 * Google Translate based translation services.
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
 * Create language options.
 */

function populateLanguages() {

    sourceLanguage.innerHTML = "";

    targetLanguage.innerHTML = "";


    const detectOption =
        document.createElement("option");

    detectOption.value = "auto";
    detectOption.textContent = "Detect language";

    sourceLanguage.appendChild(detectOption);


    LANGUAGES.forEach(([code, name]) => {

        const sourceOption =
            document.createElement("option");

        sourceOption.value = code;
        sourceOption.textContent = name;

        sourceLanguage.appendChild(sourceOption);


        const targetOption =
            document.createElement("option");

        targetOption.value = code;
        targetOption.textContent = name;

        targetLanguage.appendChild(targetOption);

    });


    sourceLanguage.value = "auto";
    targetLanguage.value = "en";
}


/*
 * Character counter.
 */

function updateCharacterCount() {

    characterCount.textContent =
        `${sourceText.value.length} / 5000`;
}


/*
 * Display errors.
 */

function showError(message) {

    errorMessage.textContent = message;
    errorMessage.classList.remove("hidden");

}


function hideError() {

    errorMessage.textContent = "";
    errorMessage.classList.add("hidden");

}


/*
 * Loading state.
 */

function setLoading(isLoading) {

    translateButton.disabled = isLoading;

    if (isLoading) {

        translateButtonText.textContent =
            "Translating";

        translateSpinner.classList.remove("hidden");

    } else {

        translateButtonText.textContent =
            "Translate";

        translateSpinner.classList.add("hidden");

    }

}


/*
 * Extract translation from different possible
 * response formats.
 *
 * Your existing API returns:
 *
 * {
 *   "response": "success",
 *   "sl": "en",
 *   "tl": "hi",
 *   "result": "..."
 * }
 */

function getTranslation(data) {

    if (!data) {
        return "";
    }


    if (typeof data === "string") {
        return data;
    }


    if (typeof data.result === "string") {
        return data.result;
    }


    if (typeof data.translation === "string") {
        return data.translation;
    }


    if (typeof data.translatedText === "string") {
        return data.translatedText;
    }


    if (typeof data.text === "string") {
        return data.text;
    }


    return "";
}


/*
 * Translate.
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


        params.set("sl", source);
        params.set("tl", target);
        params.set("q", text);


        const response =
            await fetch(
                `${API_URL}?${params.toString()}`,
                {
                    method: "GET",
                    headers: {
                        "Accept": "application/json"
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

        translationStatus.textContent = "";

        showError(
            "Unable to translate right now. Please check the API and try again."
        );

    } finally {

        setLoading(false);

    }

}


/*
 * Swap languages.
 */

function swapLanguages() {

    if (sourceLanguage.value === "auto") {

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
        translationResult.classList.contains("has-result")
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
 * Clear.
 */

function clearTranslation() {

    sourceText.value = "";

    translationResult.textContent =
        "Translation";

    translationResult.classList.remove(
        "has-result"
    );

    translationStatus.textContent = "";

    hideError();

    updateCharacterCount();

    sourceText.focus();

}


/*
 * Copy translation.
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

        await navigator.clipboard.writeText(result);

        translationStatus.textContent =
            "Copied!";

        setTimeout(() => {

            if (
                translationStatus.textContent ===
                "Copied!"
            ) {

                translationStatus.textContent =
                    "Translated";

            }

        }, 1500);

    } catch (error) {

        console.error(error);

        showError(
            "Unable to copy the translation."
        );

    }

}


/*
 * Events.
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


sourceText.addEventListener(
    "keydown",
    function (event) {

        if (
            (event.ctrlKey || event.metaKey) &&
            event.key === "Enter"
        ) {

            translate();

        }

    }
);


/*
 * Change target language and automatically
 * translate existing text.
 */

targetLanguage.addEventListener(
    "change",
    function () {

        if (sourceText.value.trim()) {
            translate();
        }

    }
);


sourceLanguage.addEventListener(
    "change",
    function () {

        if (sourceText.value.trim()) {
            translate();
        }

    }
);


/*
 * Mobile menu.
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
 * Initialize.
 */

populateLanguages();

updateCharacterCount();

document.getElementById("year").textContent =
    new Date().getFullYear();
