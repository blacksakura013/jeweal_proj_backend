const puppeteer = require('puppeteer');
const path = require('path');


const fileArray = [
    'E:\\GMS PROJECT\\backend-latest\\mockData\\inventory\\Pu_body.html'
];


const generatePDF = async (filePath, outputPath) => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();


        const fileUrl = 'file://' + path.resolve(filePath);

        await page.goto(fileUrl, { waitUntil: 'networkidle0' });



        await page.pdf({
            path: outputPath,
            format: 'A4',
            printBackground: true
        });

        console.log(`True`);
        
        // ปิดเบราว์เซอร์
        await browser.close();
    } catch (error) {
        console.error(`False`, error);
    }
};

(async () => {

    for (const [index, filePath] of fileArray.entries()) {

        const outputPath = `output_${index + 1}.pdf`;


        await generatePDF(filePath, outputPath);
    }
})();
