\# Dhiren Patel Translate API



Simple translation API using Python and Google Translate.



\## API



GET:



/api/?sl=en\&tl=hi\&q=dhiren%20patel



\## Example



https://dhiren-patel-translate.vercel.app/api/?sl=en\&tl=hi\&q=dhiren%20patel



\## Response



{

&#x20; "response": "success",

&#x20; "sl": "en",

&#x20; "tl": "hi",

&#x20; "result": "धीरेन पटेल"

}



\## Parameters



\- sl = source language

\- tl = target language

\- q = text to translate



\## Examples



English to Hindi:



/api/?sl=en\&tl=hi\&q=hello%20world



Hindi to English:



/api/?sl=hi\&tl=en\&q=नमस्ते%20दुनिया



English to Gujarati:



/api/?sl=en\&tl=gu\&q=hello%20world



English to Marathi:



/api/?sl=en\&tl=mr\&q=hello%20world



