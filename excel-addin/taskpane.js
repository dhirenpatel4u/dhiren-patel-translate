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

const getSelectionButton =
    document.getElementById("getSelectionButton");

const writeExcelButton =
    document.getElementById("writeExcelButton");

const excelInfo =
    document.getElementById("excelInfo");


let selectedExcelValues = [];

let translatedExcelValues = [];

let isExcel = false;


/* =========================================================
   STATUS
   ========================================================= */

function setStatus(
    text,
    error = false,
    success = false
) {

    status.textContent = text;

    if (error) {

        status.className =
            "status error";

    }
    else if (success) {

        status.className =
            "status success";

    }
    else {

        status.className =
            "status";

    }
}


/* =========================================================
   INITIALIZE
   ========================================================= */

function initializePage() {

    /*
     * Translate works everywhere.
     */

    translateButton.addEventListener(
        "click",
        translate
    );


    /*
     * Excel-only buttons.
     */

    if (getSelectionButton) {

        getSelectionButton.addEventListener(
            "click",
            getSelectedExcelCells
        );

    }


    if (writeExcelButton) {

        writeExcelButton.addEventListener(
            "click",
            writeTranslationToExcel
        );

    }


    /*
     * Check whether Office.js is running.
     */

    if (
        typeof Office !== "undefined" &&
        Office.onReady
    ) {

        Office.onReady(
            function (info) {

                if (
                    info.host ===
                    Office.HostType.Excel
                ) {

                    isExcel = true;

                    setStatus(
                        "Dhiren Translate is ready.",
                        false,
                        true
                    );

                }
                else {

                    setStatus(
                        "Browser mode."
                    );

                }

            }
        );

    }
    else {

        /*
         * Normal browser.
         */

        setStatus(
            "Browser mode."
        );

    }

}


/* =========================================================
   TRANSLATE
   ========================================================= */

async function translate() {

    const text =
        sourceText.value.trim();


    if (!text) {

        result.textContent =
            "Please enter text.";

        setStatus(
            "Please enter text.",
            true
        );

        return;

    }


    translateButton.disabled =
        true;


    setStatus(
        "Translating..."
    );


    try {

        /*
         * If cells were loaded from Excel,
         * translate each cell separately.
         */

        if (
            selectedExcelValues.length > 0
        ) {

            await translateExcelCells();

        }
        else {

            /*
             * Normal text translation.
             */

            const translated =
                await translateSingleText(
                    text
                );


            result.textContent =
                translated;


            setStatus(
                "Translation completed.",
                false,
                true
            );

        }

    }
    catch (error) {

        console.error(error);


        result.textContent =
            "Unable to translate.";


        setStatus(
            error.message,
            true
        );

    }
    finally {

        translateButton.disabled =
            false;

    }

}


/* =========================================================
   TRANSLATE SINGLE TEXT
   ========================================================= */

async function translateSingleText(text) {

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


    return translated;
}


/* =========================================================
   GET SELECTED EXCEL CELLS
   ========================================================= */

async function getSelectedExcelCells() {

    if (!isExcel) {

        setStatus(
            "This button works only inside Excel.",
            true
        );

        return;

    }


    try {

        setStatus(
            "Reading selected Excel cells..."
        );


        await Excel.run(
            async function (context) {

                const range =
                    context.workbook
                        .getSelectedRange();


                range.load([
                    "address",
                    "values",
                    "rowCount",
                    "columnCount"
                ]);


                await context.sync();


                selectedExcelValues =
                    range.values;


                /*
                 * Put Excel contents into textarea.
                 */

                const text =
                    selectedExcelValues
                        .map(
                            function (row) {

                                return row
                                    .map(
                                        function (cell) {

                                            return cell === null ||
                                                cell === undefined
                                                ? ""
                                                : String(cell);

                                        }
                                    )
                                    .join("\t");

                            }
                        )
                        .join("\n");


                sourceText.value =
                    text;


                translatedExcelValues =
                    [];


                excelInfo.textContent =
                    "Selected: " +
                    range.address;


                result.textContent =
                    "Translation will appear here.";


                setStatus(
                    "Excel cells loaded.",
                    false,
                    true
                );

            }
        );

    }
    catch (error) {

        console.error(error);


        setStatus(
            "Excel error: " +
            error.message,
            true
        );

    }

}


/* =========================================================
   TRANSLATE EXCEL CELLS
   ========================================================= */

async function translateExcelCells() {

    const rows =
        selectedExcelValues.length;


    const columns =
        rows > 0
            ? selectedExcelValues[0].length
            : 0;


    translatedExcelValues =
        Array.from(
            {
                length: rows
            },
            function () {

                return Array(
                    columns
                ).fill("");

            }
        );


    let total = 0;

    let completed = 0;


    /*
     * Count non-empty cells.
     */

    for (
        let r = 0;
        r < rows;
        r++
    ) {

        for (
            let c = 0;
            c < columns;
            c++
        ) {

            const value =
                selectedExcelValues[r][c];


            if (
                value !== null &&
                value !== undefined &&
                String(value).trim() !== ""
            ) {

                total++;

            }

        }

    }


    /*
     * Translate each cell.
     */

    for (
        let r = 0;
        r < rows;
        r++
    ) {

        for (
            let c = 0;
            c < columns;
            c++
        ) {

            const value =
                selectedExcelValues[r][c];


            if (
                value === null ||
                value === undefined ||
                String(value).trim() === ""
            ) {

                translatedExcelValues[r][c] =
                    "";

                continue;

            }


            translatedExcelValues[r][c] =
                await translateSingleText(
                    String(value)
                );


            completed++;


            setStatus(
                `Translated ${completed} of ${total} cell(s)...`
            );

        }

    }


    /*
     * Display result.
     */

    const displayText =
        translatedExcelValues
            .map(
                function (row) {

                    return row.join("\t");

                }
            )
            .join("\n");


    result.textContent =
        displayText;


    setStatus(
        "Translation completed.",
        false,
        true
    );

}


/* =========================================================
   WRITE BACK TO EXCEL
   ========================================================= */

async function writeTranslationToExcel() {

    if (!isExcel) {

        setStatus(
            "This button works only inside Excel.",
            true
        );

        return;

    }


    if (
        translatedExcelValues.length === 0
    ) {

        setStatus(
            "Translate something first.",
            true
        );

        return;

    }


    try {

        writeExcelButton.disabled =
            true;


        setStatus(
            "Writing translation to Excel..."
        );


        await Excel.run(
            async function (context) {

                const range =
                    context.workbook
                        .getSelectedRange();


                range.values =
                    translatedExcelValues;


                await context.sync();

            }
        );


        setStatus(
            "Translation written to Excel.",
            false,
            true
        );

    }
    catch (error) {

        console.error(error);


        setStatus(
            "Excel error: " +
            error.message,
            true
        );

    }
    finally {

        writeExcelButton.disabled =
            false;

    }

}


/* =========================================================
   START
   ========================================================= */

initializePage();
