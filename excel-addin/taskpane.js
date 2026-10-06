"use strict";


const API_URL =
    "https://dhiren-patel-translate.vercel.app/api/";


const sourceLanguage =
    document.getElementById("sourceLanguage");

const targetLanguage =
    document.getElementById("targetLanguage");

const sourceText =
    document.getElementById("sourceText");

const translateButton =
    document.getElementById("translateButton");

const result =
    document.getElementById("result");

const status =
    document.getElementById("status");


function setStatus(text, error = false) {

    status.textContent = text;

    status.className =
        error
            ? "status error"
            : "status";

}


async function translate() {

    const text =
        sourceText.value.trim();


    if (!text) {

        result.textContent =
            "Please enter text.";

        return;

    }


    translateButton.disabled = true;

    setStatus("Translating...");


    try {

        const params =
            new URLSearchParams({

                sl:
                    sourceLanguage.value,

                tl:
                    targetLanguage.value,

                q:
                    text

            });


        const response =
            await fetch(
                `${API_URL}?${params.toString()}`
            );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        const translated =
            data.result ||
            data.translation ||
            data.translatedText ||
            "";


        if (!translated) {

            throw new Error(
                "No translation returned."
            );

        }


        result.textContent =
            translated;


        setStatus(
            "Translation completed."
        );


    } catch (error) {

        console.error(error);

        result.textContent =
            "Unable to translate.";

        setStatus(
            error.message,
            true
        );

    } finally {

        translateButton.disabled =
            false;

    }

}


translateButton.addEventListener(
    "click",
    translate
);
