console.log('hi');

/*
    1. get document ------------------------
    // this will return PDFDocumentLoadingTask instance
    const loadingTask = pdfjsLib.getDocument({url: ''hi.pdf});
    loadingTask.promise.then(function(pdf) {
        // you can now use pef here 
    });

    2. page ----------------------
    pdf.getPage(1).then(function(page) {
        // you can now use page here
    });

    3. rendering the page -----------------------
    // by default the viewport is scaled to the original size of the PDF
    // but this can be changed by modifying the viewport.

*/

$(document).ready(function() {
    console.log('pdfjsLib', pdfjsLib);

    // vanilla javascript =========================
//     let pdfDoc = null;
//     let currentPage = 1;

//     const canvas = document.getElementById('pdfCanvas');
//     const ctx = canvas.getContext('2d');

//     // load pdf
//     document.getElementById('pdfFile').addEventListener('change', async (e)=> {
//         const file = e.target.files[0];

//         if(!file) return;

//         try {
//             const buffer = await file.arrayBuffer();

//             pdfDoc = await pdfjsLib.getDocument({
//                 data: new Uint8Array(buffer)

//             }).promise;

//             currntPage = 1;

//             document.getElementById('pageCount').textContent = pdfDoc.numPages;

//             await renderPage(currentPage);
//         } catch (error) {
//             console.log('PDF loading error:', error);
//         }
//     });

//     // render pdf page
//     async function renderPage(pageNumber) {
//         const page = await pdfDoc.getPage(pageNumber);

//         const viewport = page.getViewport({
//             scale: 1.5
//         });

//         canvas.width = visualViewport.width;
//         canvas.height = visualViewport.height;

//         await page.render({
//             canvas,
//             canvasContext: ctx,
//             viewport
//         }).promise;

//         document.getElementById('pageNum').textContent = pageNumber;
//     }

//     // previous page
//     document.getElementById('prevPage').addEventListener('click', async () => {
//         if(currentPage <= 1) return;

//         currentPage--;

//         await renderPage(currentPage);
//     });

//     // next page
//     document.getElementById('nextPage').addEventListener('click', async () => {
//         if(!pdfDoc || currentPage >= pdfDoc.numPages) return;

//         currntPage++;

//         await renderPage(currntPage);
//     })

    // jQuery ======================
    // let pdfDoc = null;
    // let currentPage = 1;

    // const canvas = $('#pdfCanvas')[0];
    // const ctx = canvas.getContext('2d');

    // // Load PDF
    // $('#pdfFile').on('change', async function(e) {
    //     const file = e.target.files[0];

    //     if (!file) return;

    //     try {
    //         const buffer = await file.arrayBuffer();

    //         pdfDoc = await pdfjsLib.getDocument({
    //             data: new Uint8Array(buffer)
    //         }).promise;

    //         currentPage = 1;

    //         $('#pageCount').text(pdfDoc.numPages);

    //         await renderPage(currentPage);

    //     } catch (error) {
    //         console.error(error);
    //     }
    // });

    // // Render page
    // async function renderPage(pageNum) {
    //     const page = await pdfDoc.getPage(pageNum);

    //     const viewport = page.getViewport({
    //         scale: 1.5
    //     });

    //     canvas.width = viewport.width;
    //     canvas.height = viewport.height;

    //     await page.render({
    //         canvas,
    //         canvasContext: ctx,
    //         viewport
    //     }).promise;

    //     $('#pageNum').text(pageNum);
    // }

    // // Previous
    // $('#prevPage').on('click', async function() {
    //     if (currentPage > 1) {
    //         currentPage--;
    //         await renderPage(currentPage);
    //     }
    // });

    // // Next
    // $('#nextPage').on('click', async function() {
    //     if (pdfDoc && currentPage < pdfDoc.numPages) {
    //         currentPage++;
    //         await renderPage(currentPage);
    //     }
    // });


    // load PDF - url (from pdf.js doc) ===============================
    // const url = "https://jinredhub.github.io/my-website/images/jin-redmond-resume.pdf";
    // const loadingTask = pdfjsLib.getDocument({url});
    // loadingTask.promise.then(function(pdf) {
    //     console.log('pdf loaded');

    //     // fetch first page
    //     let pageNumber = 1;
    //     pdf.getPage(pageNumber).then(function(page) {
    //         console.log('page loaded');

    //         const scale = 1.5;
    //         const viewport = page.getViewport({scale: scale}); 

    //         //  prepare canvas using pdf page dimensions
    //         const canvas = document.getElementById('pdfCanvas');
    //         const context = canvas.getContext('2d');
    //         canvas.height = viewport.height;
    //         canvas.width = viewport.width;

    //         const renderContext = {
    //             canvasContext: context,
    //             viewport: viewport
    //         };

    //         const renderTask = page.render(renderContext);
    //         renderTask.promise.then(function() {
    //             console.log('page rendered');
    //         });
            
    //     });
    // }, function(reason) {
    //     // pdf loading error
    //     console.error(reason);
    // });

    // // previous/next example? (from pdf.js doc) ======================
    // const url = "https://jinredhub.github.io/my-website/images/jin-redmond-resume.pdf";

    // let pdfDoc = null;
    // let pageNum = 1;
    // let pageRendering = false;
    // let pageNumPending = null;
    // let scale = 0.8;
    // const canvas = document.getElementById('pdfCanvas');
    // const ctx = canvas.getContext('2d');

    // // get page info from document, resize canvas accordingly, and render page
    // function renderPage(num) {
    //     pageRendering = true;

    //     pdfDoc.getPage(num).then(function(page) {
    //         const viewport = page.getViewport({scale: scale});
    //         canvas.height = viewport.height;
    //         canvas.width = viewport.width;

    //         // render pdf page into canvas context
    //         const renderContext = {
    //             canvasContext: ctx,
    //             viewport: viewport
    //         };

    //         const renderTask = page.render(renderContext);

    //         // wait for rendering to finish
    //         renderTask.promise.then(function() {
    //             pageRendering = false;
    //             if(pageNumPending !== null) {
    //                 // new page rendering is pending
    //                 renderPage(pageNumPending);
    //                 pageNumPending = null;
    //             }
    //         });

    //         // update page counters
    //         // document.getElementById('nnn').textContent = num;
    //     });
    // }

    // pdfjsLib.getDocument({url}).promise.then(function(pdfDoc_) {
    //     pdfDoc = pdfDoc_;
    //     // document.getElementById()

    //     // initial/first page rendering
    //     renderPage(pageNum);
    // });

    // // if another page rendering in progress, wait until it is done
    // function queueRenderPage(num) {
    //     if(pageRendering) {
    //         pageNumPending = num;
    //     }
    //     else {
    //         renderPage(num);
    //     }
    // }

    // // display previous page
    // function onPrevPage() {
    //     if(pageNum <= 1) {
    //         return;
    //     }
    //     pageNum--;
    //     queueRenderPage(pageNum);
    // }
    // document.getElementById('prevPage').addEventListener('click', onPrevPage);

    // // display next page
    // function onNextPage() {
    //     if(pageNum >= pdfDoc.numPages) {
    //         return;
    //     }
    //     pageNum++;
    //     queueRenderPage(pageNum);
    // }
    // document.getElementById('nextPage').addEventListener('click', onNextPage)


    // previous/next example? (from pdf.js doc) + input ======================
    // const url = "https://jinredhub.github.io/my-website/images/jin-redmond-resume.pdf";

    let pdfDoc = null;
    let pageNum = 1;
    let pageRendering = false;
    let pageNumPending = null;
    let scale = 0.8;
    const canvas = document.getElementById('pdfCanvas');
    const ctx = canvas.getContext('2d');

    // get page info from document, resize canvas accordingly, and render page
    function renderPage(num) {
        pageRendering = true;

        pdfDoc.getPage(num).then(function(page) {
            const viewport = page.getViewport({scale: scale});
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            // render pdf page into canvas context
            const renderContext = {
                canvasContext: ctx,
                viewport: viewport
            };

            const renderTask = page.render(renderContext);

            // wait for rendering to finish
            renderTask.promise.then(function() {
                pageRendering = false;
                if(pageNumPending !== null) {
                    // new page rendering is pending
                    renderPage(pageNumPending);
                    pageNumPending = null;
                }
            });

            // update page counters
            // document.getElementById('nnn').textContent = num;
        });
    }

    // pdfjsLib.getDocument({url}).promise.then(function(pdfDoc_) {
    //     pdfDoc = pdfDoc_;
    //     // document.getElementById()

    //     // initial/first page rendering
    //     renderPage(pageNum);
    // });

    // load pdf
    document.getElementById('pdf').addEventListener('change', async (e)=> {
        const file = e.target.files[0];

        if(!file) return;

        try {
            const buffer = await file.arrayBuffer();

            pdfDoc = await pdfjsLib.getDocument({
                data: new Uint8Array(buffer)

            }).promise;

            currntPage = 1;

            document.getElementById('pageCount').textContent = pdfDoc.numPages;

            await renderPage(currentPage);
        } catch (error) {
            console.log('PDF loading error:', error);
        }
    });



    // if another page rendering in progress, wait until it is done
    function queueRenderPage(num) {
        if(pageRendering) {
            pageNumPending = num;
        }
        else {
            renderPage(num);
        }
    }

    // display previous page
    function onPrevPage() {
        if(pageNum <= 1) {
            return;
        }
        pageNum--;
        queueRenderPage(pageNum);
    }
    document.getElementById('prevPage').addEventListener('click', onPrevPage);

    // display next page
    function onNextPage() {
        if(pageNum >= pdfDoc.numPages) {
            return;
        }
        pageNum++;
        queueRenderPage(pageNum);
    }
    document.getElementById('nextPage').addEventListener('click', onNextPage)


});