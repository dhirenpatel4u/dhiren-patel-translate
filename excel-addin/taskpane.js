"use strict";

/* global Office, Excel */


/* =========================================================
   API
   ========================================================= */

const API_URL =
    "https://dhiren-patel-translate.vercel.app/api/";


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const sourceLanguage =
    document.getElementById(
        "sourceLanguage"
    );


const targetLanguage =
    document.getElementById(
        "targetLanguage"
    );


const sourceText =
    document.getElementById(
        "sourceText"
    );


const translateButton =
    document.getElementById(
        "translateButton"
    );


const result =
    document.getElementById(
        "result"
    );


const status =
    document.getElementById(
        "status"
    );


const getSelectionButton =
    document.getElementById(
        "getSelectionButton"
    );


const writeExcelButton =
    document.getElementById(
        "writeExcelButton"
    );


const excelInfo =
    document.getElementById(
        "excelInfo"
    );


/* =========================================================
   VARIABLES
   ========================================================= */

/*
 * Stores the Excel range that was selected.
 */

let selectedExcelRange = null;


/*
 * Stores the original values from Excel.
 */

let selectedExcelValues = [];


/*
 * Stores translated values.
 */

let translatedExcelValues = [];


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
   EXCEL INITIALIZATION
   ========================================================= */

Office.onReady(
    function (info) {

        if (
            info.host !==
            Office.HostType.Excel
        ) {

            setStatus(
                "This add-in must be opened in Excel.",
                true
            );

            return;

        }


        /*
         * Get Excel selection.
         */

        getSelectionButton.addEventListener(
            "click",
            getSelectedExcelCells
        );


        /*
         * Translate.
         */

        translateButton.addEventListener(
            "click",
            translate
        );


        /*
         * Write translation back.
         */

        writeExcelButton.addEventListener(
            "click",
            writeTranslationToExcel
        );


        setStatus(
            "Dhiren Translate is ready.",
            false,
            true
        );

    }
);


/* =========================================================
   GET SELECTED EXCEL CELLS
   ========================================================= */

async function getSelectedExcelCells() {

    try {

        setStatus(
            "Reading selected Excel cells..."
        );


        await Excel.run(
            async function (context) {


                /*
                 * Get currently selected range.
                 */

                const range =
                    context.workbook
                        .getSelectedRange();


                /*
                 * Load range information.
                 */

                range.load([
                    "address",
                    "values",
                    "rowCount",
                    "columnCount"
                ]);


                await context.sync();


                /*
                 * Save selection.
                 */

                selectedExcelRange =
                    range;


                selectedExcelValues =
                    range.values;


                /*
                 * Convert cells to text.
                 */

                const lines =
                    selectedExcelValues.map(
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
                    );


                sourceText.value =
                    lines.join("\n");


                /*
                 * Clear old translation.
                 */

                translatedExcelValues = [];


                result.textContent =
                    "Translation will appear here.";


                /*
                 * Display selection info.
                 */

                excelInfo.textContent =
                    "Selected: " +
                    range.address +
                    " (" +
                    range.rowCount +
                    " row(s), " +
                    range.columnCount +
                    " column(s))";


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
   TRANSLATE
   ========================================================= */

async function translate() {

    const text =
        sourceText.value.trim();


    /*
     * Check text.
     */

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


    writeExcelButton.disabled =
        true;


    setStatus(
        "Translating..."
    );


    try {


        /*
         * If Excel cells were loaded,
         * translate each cell separately.
         */

        if (
            selectedExcelValues.length > 0
        ) {

            await translateExcelCells();

        }
        else {

            /*
             * Normal manual translation.
             */

            const translated =
                await translateSingleText(
                    text
                );


            result.textContent =
                translated;

        }


        setStatus(
            "Translation completed.",
            false,
            true
        );

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


        writeExcelButton.disabled =
            false;

    }

}


/* =========================================================
   TRANSLATE ONE TEXT
   ========================================================= */

async function translateSingleText(
    text
) {

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
   TRANSLATE EXCEL CELLS
   ========================================================= */

async function translateExcelCells() {

    /*
     * Number of rows.
     */

    const rowCount =
        selectedExcelValues.length;


    /*
     * Number of columns.
     */

    const columnCount =
        rowCount > 0
            ? selectedExcelValues[0].length
            : 0;


    /*
     * Prepare output array.
     */

    translatedExcelValues =
        Array.from(
            {
                length: rowCount
            },
            function () {

                return Array(
                    columnCount
                ).fill("");

            }
        );


    /*
     * Count cells.
     */

    let totalCells = 0;


    for (
        let r = 0;
        r < rowCount;
        r++
    ) {

        for (
            let c = 0;
            c < columnCount;
            c++
        ) {

            const value =
                selectedExcelValues[r][c];


            if (
                value !== null &&
                value !== undefined &&
                String(value).trim() !== ""
            ) {

                totalCells++;

            }

        }

    }


    let completedCells = 0;


    /*
     * Translate every non-empty cell.
     */

    for (
        let r = 0;
        r < rowCount;
        r++
    ) {

        for (
            let c = 0;
            c < columnCount;
            c++
        ) {

            const value =
                selectedExcelValues[r][c];


            /*
             * Empty cell.
             */

            if (
                value === null ||
                value === undefined ||
                String(value).trim() === ""
            ) {

                translatedExcelValues[r][c] =
                    "";

                continue;

            }


            /*
             * Translate.
             */

            translatedExcelValues[r][c] =
                await translateSingleText(
                    String(value)
                );


            completedCells++;


            setStatus(
                "Translated " +
                completedCells +
                " of " +
                totalCells +
                " cell(s)..."
            );

        }

    }


    /*
     * Display translated values.
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
        "All cells translated.",
        false,
        true
    );

}


/* =========================================================
   WRITE TRANSLATION TO EXCEL
   ========================================================= */

async function writeTranslationToExcel() {

    /*
     * Check whether Excel data exists.
     */

    if (
        !selectedExcelValues ||
        selectedExcelValues.length === 0
    ) {

        setStatus(
            "First select Excel cells.",
            true
        );

        return;

    }


    /*
     * Check translated data.
     */

    if (
        !translatedExcelValues ||
        translatedExcelValues.length === 0
    ) {

        setStatus(
            "Translate the selected cells first.",
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


                /*
                 * Get currently selected range.
                 *
                 * This allows the user to select
                 * the same range again before
                 * writing.
                 */

                const range =
                    context.workbook
                        .getSelectedRange();


                /*
                 * Write translated values.
                 */

                range.values =
                    translatedExcelValues;


                /*
                 * Save changes.
                 */

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
