$(document).ready(function () {
    console.log("pdfjsLib", pdfjsLib);

    // previous/next example? (from pdf.js doc) + input ======================
    let pdfDoc = null;
    let pageNum = 1;
    let pageRendering = false;
    let pageNumPending = null;
    let scale = 0.8;
    const canvas = document.getElementById("pdfCanvas");
    const ctx = canvas.getContext("2d");

    // get page info from document, resize canvas accordingly, and render page
    function renderPage(num) {
        pageRendering = true;

        pdfDoc.getPage(num).then(function (page) {
        const viewport = page.getViewport({ scale: scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // render pdf page into canvas context
        const renderContext = {
            canvasContext: ctx,
            viewport: viewport,
        };

        const renderTask = page.render(renderContext);

        // wait for rendering to finish
        renderTask.promise.then(function () {
            pageRendering = false;
            if (pageNumPending !== null) {
                // new page rendering is pending
                renderPage(pageNumPending);
                pageNumPending = null;
            }
        });

        // update page counters
        // document.getElementById('nnn').textContent = num;
        });
    }

    // load pdf when 
    document.getElementById("pdfInput").addEventListener("change", async (e) => {
        const file = e.target.files[0];

        if (!file) return;

        try {
            const buffer = await file.arrayBuffer();

            pdfDoc = await pdfjsLib.getDocument({
                data: new Uint8Array(buffer),
            }).promise;

            currentPage = 1;

            document.getElementById("pageCount").textContent = pdfDoc.numPages;

            await renderPage(currentPage);
        } catch (error) {
            console.log("PDF loading error:", error);
        }
    });

    // if another page rendering in progress, wait until it is done
    function queueRenderPage(num) {
        if (pageRendering) {
            pageNumPending = num;
        } else {
            renderPage(num);
        }
    }

    // display previous page
    function onPrevPage() {
        if (pageNum <= 1) {
            return;
        }
        pageNum--;
        queueRenderPage(pageNum);
    }
    document.getElementById("prevPage").addEventListener("click", onPrevPage);

    // display next page
    function onNextPage() {
        if (pageNum >= pdfDoc.numPages) {
            return;
        }
        pageNum++;
        queueRenderPage(pageNum);
    }
    document.getElementById("nextPage").addEventListener("click", onNextPage);

    // 
    let fileId = null;

    function addMessage(message, type) {
        const chat = document.getElementById("chat");
        const div = document.createElement("div");

        div.className = "message " + type;
        div.textContent = message;

        chat.appendChild(div);
        chat.scrollTop = chat.scrollHeight;
    }

    // Upload PDF directly to OpenAI

    async function uploadPDF() {
        const apiKey = document.getElementById("apiKey").value;
        const pdf = document.getElementById("pdfInput").files[0];
        const status = document.getElementById("status");

        if (!apiKey || !pdf) {
            alert("Enter API key and select PDF");
            return;
        }

        if (pdf.type !== "application/pdf" || pdf.size > 50 * 1024 * 1024) {
            alert("Select a PDF smaller than 50 MB");
            return;
        }

        status.innerText = "Uploading PDF...";

        try {
            const formData = new FormData();

            formData.append("file", pdf);
            formData.append("purpose", "user_data");

            const response = await fetch("https://api.openai.com/v1/files", {
                method: "POST",

                headers: {
                Authorization: "Bearer " + apiKey,
                },

                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || "Upload failed");
            }

            fileId = data.id;
            console.log('fileId', fileId)

            status.innerText = "Uploaded: " + pdf.name;

            document.getElementById("askBtn").disabled = false;

            addMessage("PDF uploaded successfully! Ask your questions.", "ai");
        } catch (error) {
            status.innerText = error.message;
        }
    }
    $("#uploadPdfButton").on("click", uploadPDF);

    // Ask questions about PDF

    async function askQuestion() {
        const apiKey = document.getElementById("apiKey").value;
        const question = document.getElementById("question").value.trim();

        if (!fileId || !question) return;

        document.getElementById("question").value = "";

        addMessage(question, "user");

        const askBtn = document.getElementById("askBtn");
        askBtn.disabled = true;

        const loading = document.createElement("div");
        loading.className = "message ai";
        loading.textContent = "AI is thinking...";

        document.getElementById("chat").appendChild(loading);

        try {
            const response = await fetch("https://api.openai.com/v1/responses", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + apiKey,
                },
                body: JSON.stringify({
                    model: "gpt-5.6-sol",
                    instructions: `
                            You are a PDF question answering assistant.

                            Answer using the uploaded PDF.

                            If information is not available
                            in the document, say so.

                            Do not invent information.
                            Mention page numbers when possible.
                        `,
                    input: [
                        {
                            role: "user",
                            content: [
                                {
                                    type: "input_file",
                                    file_id: fileId,
                                },
                                {
                                    type: "input_text",
                                    text: question,
                                },
                            ],
                        },
                    ],
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || "Request failed");
            }

            loading.remove();

            const answer = data.output
                .flatMap((item) => item.content || [])
                .filter((item) => item.type === "output_text")
                .map((item) => item.text)
                .join("\n");

            addMessage(answer || "No text response returned.", "ai");
        } catch (error) {
            loading.remove();

            addMessage("Error: " + error.message, "ai");
        } finally {
            askBtn.disabled = false;
        }
    }
    $("#askBtn").on("click", askQuestion);

});
