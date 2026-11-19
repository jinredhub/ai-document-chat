/*
    PDF.js note ====================================
    - The core functionality of pdfjsLib revolves around a few primary 
    asynchronous methods used to load, read, extract, and render documents

    1. get/load document ------------------------
    // this will return PDFDocumentLoadingTask instance
    const loadingTask = pdfjsLib.getDocument({url: ''hi.pdf});
    loadingTask.promise.then(function(pdf) {
        // you can now use pef here 
    });

    2. working with page ----------------------
    // fetches a specific page from the loaded PDF doc.
    pdfDoc.getPage(1).then(function(page) {
        // you can now use page here
    });

    // calculates the dimensional layout (with and height) of a page at a given zoom scale
    page.getViewport({ scale, rotation });

    3. rendering the page -----------------------
    // renders the PDF page graphics into a target 2D canvas
    page.render(renderPrameters)

    - Dynamic Scale Calculation: Replace hardcoded scale = 0.8 with a dynamic calculation based on container.clientWidth divided by the page's natural width at scale 1.0.
    - HiDPI / Retina Sharpness: Add window.devicePixelRatio to scaling to the canvas context rendering.

    OpenAI note =====================================
    Uploaded file will be save on the account indefinitly and eventyally it will cost storage fee.
    - To configure an expiration policy for files uploaded via the OpenAI Files API, you can include the optional expires_after parameter. It takes an object specifying an anchor (e.g., created_at) and a duration in seconds (ranging between 3,600 seconds/1 hour and 2,592,000 seconds/30 days).

*/

$(document).ready(function () {
    console.log("pdfjsLib", pdfjsLib);

    let pdfDoc = null;
    let pageNum = 1;
    let pageRendering = false;
    let pageNumPending = null;

    const canvas = document.getElementById("pdfCanvas");
    const ctx = canvas.getContext("2d");

    const container = document.getElementById("pdfContainer");
    const textLayerDiv = document.getElementById("textLayer");
    const linkLayerDiv = document.getElementById("linkLayer");

    // get page info from document, resize canvas accordingly, and render page
    async function renderPage(num) {
        if (!pdfDoc) return;

        pageRendering = true;

        try {
            const page = await pdfDoc.getPage(num);

            // base viewport at scale 1.0 to get original pdf dimensions
            const unscaledViewport = page.getViewport({ scale: 1.0 });

            // calculate scale dynamically to fit the container's current width
            const containerWidth = container.clientWidth || unscaledViewport.width;
            const scale = containerWidth / unscaledViewport.width;

            const viewport = page.getViewport({ scale: scale });

            // set canvas physical pixel dimensions for high DPI sharpness
            const outputScale = window.devicePixelRatio || 1;
            canvas.width = Math.floor(viewport.width * outputScale);
            canvas.height = Math.floor(viewport.height * outputScale);

            // css display size
            canvas.style.width = Math.floor(viewport.width) + "px";
            canvas.style.height = Math.floor(viewport.height) + "px";

            const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

            // render pdf page into canvas context
            const renderContext = {
                canvasContext: ctx,
                viewport: viewport,
                transform: transform
            };

            await page.render(renderContext).promise;

            // text layer ================================

            // set text layer dimensions
            textLayerDiv.replaceChildren();
            textLayerDiv.style.width = viewport.width + "px";
            textLayerDiv.style.height = viewport.height + "px";

            // get pdf text content
            const textContent = await page.getTextContent();

            const textLayer = new pdfjsLib.TextLayer({
                textContentSource: textContent,
                container: textLayerDiv,
                viewport: viewport
            });

            await textLayer.render();

            // clickable links and navigation =======================

            await renderLinks(page, viewport);

            // if (pageNumPending !== null) {
            //     const pendingPage = pageNumPending;
            //     pageNumPending = null;
            //     renderPage(pendingPage);
            // }

            // update page counters
            document.getElementById("pageNum").textContent = num;

        } catch (error) {
            console.error("Page rendering error:", error);
        } finally {
            pageRendering = false;

            if (pageNumPending !== null) {
                const pendingPage = pageNumPending;
                pageNumPending = null;
                renderPage(pendingPage);
            }
        }       
    }

    // render pdf links
    async function renderLinks(page, viewport) {
        // clear existing links
        linkLayerDiv.replaceChildren();
        linkLayerDiv.style.width = viewport.width + "px";
        linkLayerDiv.style.height = viewport.height + "px";

        // get pdf annotations
        const annotations = await page.getAnnotations({
            intent: "display"
        });

        for (const annotation of annotations) {
            console.log('annotation', annotation);
            // only process link annotations
            if (annotation.subtype !== "Link") {
                continue;
            }

            if(!annotation.rect) {
                continue;
            }

            // convert pdf coordinates to viewport
            const rect = annotation.rect;

            // convert bottom-left pdf coordinate
            const point1 = viewport.convertToViewportPoint(rect[0], rect[1]);

            // convert top-right pdf coordinate
            const point2 = viewport.convertToViewportPoint(rect[2], rect[3]);

            // calculate screen coordinates
            const left = Math.min(point1[0], point2[0]);

            const top = Math.min(point1[1], point2[1]);

            const width = Math.abs(point2[0] - point1[0]);

            const height = Math.abs(point2[1] - point1[1]);

            // Create clickable link
            const link = document.createElement("a");

            link.style.left = left + "px";
            link.style.top = top + "px";

            link.style.width = width + "px";
            link.style.height = height + "px";

            // external links
            const externalUrl = annotation.url || annotation.unsafeUrl;

            if (externalUrl) {
                let parsedUrl;

                try {
                    parsedUrl = new URL(
                        externalUrl,
                        document.baseURI
                    );
                } catch (error) {
                    console.warn("Invalid PDF link:", externalUrl);
                    continue;
                }

                // Only allow safe navigation protocols
                if (!["http:", "https:", "mailto:", "tel:"].includes(parsedUrl.protocol)) {
                    continue;
                }

                link.href = parsedUrl.href;
                link.target = "_blank";
                link.rel = "noopener noreferrer";
                link.title = "Open external link";
            }

            // internal pdf navigation
            else if (annotation.dest) {
                link.href = "#";
                link.title = "Go to another page in this PDF";

                // Capture destination
                const destination = annotation.dest;

                link.addEventListener("click", async function (event) {

                    event.preventDefault();

                    try {
                        let dest = destination;

                        // Resolve named destinations
                        if (typeof dest === "string") {
                            dest = await pdfDoc.getDestination(dest);
                        }

                        if (!dest || !Array.isArray(dest)) {
                            return;
                        }

                        // Get destination page reference
                        const pageReference = dest[0];

                        // Convert page reference to page number
                        const destinationPage = await pdfDoc.getPageIndex(pageReference);

                        // PDF.js pages are zero-indexed
                        const targetPage = destinationPage + 1;

                        if (
                            targetPage < 1 ||
                            targetPage > pdfDoc.numPages
                        ) {
                            return;
                        }

                        // Navigate to destination page
                        pageNum = targetPage;

                        queueRenderPage(pageNum);

                    } catch (error) {
                        console.error("PDF navigation error:", error);
                    }
                });
            }
            // skip annotations without a usable destination
            else {
                continue;
            }

            // add link to the link layer
            linkLayerDiv.appendChild(link);
        }
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

            pageNum = 1;
            pageNumPending = null;
            document.getElementById("pageCount").textContent = pdfDoc.numPages;

            await renderPage(pageNum);
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
    document.getElementById("prevPage").addEventListener("click", () => {
        if (!pdfDoc || pageNum <= 1) {
            return;
        }
        pageNum--;
        queueRenderPage(pageNum);
    });

    // display next page
    document.getElementById("nextPage").addEventListener("click", () => {
        if (!pdfDoc || pageNum >= pdfDoc.numPages) {
            return;
        }
        pageNum++;
        queueRenderPage(pageNum);
    });

    // re-render current page smoothly on window resize
    let resizeTimer;
    window.addEventListener("resize", () => {
        if (!pdfDoc) return;
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            queueRenderPage(pageNum);
        }, 150);
    });

    // end pdf.js ============================

    // upload pdf, ask questions =======================

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
        const statusError = document.getElementById("statusError");

        // empty error message
        statusError.innerText = "";

        if (!apiKey || !pdf) {
            alert("Enter API key and select PDF");
            return;
        }

        if (pdf.type !== "application/pdf" || pdf.size > 50 * 1024 * 1024) {
            alert("Select a PDF smaller than 50 MB");
            return;
        }

        addMessage("Uploading PDF...", "ai");

        try {
            const formData = new FormData();

            formData.append("file", pdf);
            formData.append("purpose", "user_data");

            // add expiration policy parameters
            // expires after24 hours (86400 seconds)
            // valid range: 3600 (1 hour) to 2592000 (30 days)
            formData.append("expires_after[anchor]", "created_at");
            formData.append("expires_after[seconds]", "86400");

            const response = await fetch("https://api.openai.com/v1/files", {
                method: "POST",

                headers: {
                    Authorization: "Bearer " + apiKey,
                },

                body: formData,
            });

            const data = await response.json();

            console.log('response ', response);
            console.log('response data', data);

            if (!response.ok) {
                throw new Error(data.error?.message || "Upload failed");
            }

            fileId = data.id;
            console.log('fileId', fileId)

            document.getElementById("askBtn").disabled = false;

            addMessage("PDF uploaded successfully! Ask your questions.", "ai");

        } catch (error) {
            statusError.innerText = error.message;
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

            console.log('answer res', response);
            console.log('answer data', data);

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

    // custom file input -------------------------
    const inputs = document.querySelectorAll('.inputfile');
    Array.prototype.forEach.call(inputs, function(input){
        const label = input.nextElementSibling;
        const labelVal = label.innerHTML;

        input.addEventListener('change', function(e){
            let fileName = '';
            if(this.files && this.files.length > 1){
                fileName = (this.getAttribute('data-multiple-caption') || '').replace('{count}', this.files.length);
            }
            else{
                fileName = e.target.value.split('\\').pop();
            }

            if(fileName){
                label.querySelector('span').innerHTML = fileName;
            }
            else{
                label.innerHTML = labelVal;
            }
        });
    });
    // end custom file input -------------------------


});
