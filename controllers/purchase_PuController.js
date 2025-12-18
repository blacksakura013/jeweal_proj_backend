  var invoiceHeader = readFile(BASEPATH + partials?.HeaderPath, 'utf-8');
  var invoiceFooter = readFile(BASEPATH + partials?.FooterPath, 'utf-8');
  var invoiceBody = await readFile(BASEPATH + printData.printTemplat, 'utf-8');
  let templateBodyData = {

}
let templateGenaralData = {

};

  let invoiceHeaderHtml = await invoiceHeader;

  invoiceHeaderHtml = hb.compile(invoiceHeaderHtml, {
      strict: true
  });



  let invoiceFooterHtml = await invoiceFooter;

  invoiceFooterHtml = hb.compile(invoiceFooterHtml, {
      strict: true

  });


// ise console nhi kr skte? 
  let invoiceBodyHtml = await invoiceBody;

  invoiceBodyHtml = hb.compile(invoiceBodyHtml, {
      strict: true
  });

  const result = invoiceBodyHtml(templateBodyData);

  const html = result;


  //const browser = await puppeteer.launch({  headless: 'true ' }); // this mode is good for check layout

  const browser = await puppeteer.launch({  headless: 'new', args: ['--no-sandbox'] ,timeout: 0 });

  const page = await browser.newPage()
  await page.setContent(html);

  await page.pdf({
      path: './public/reports/' + pdfname,
      format: 'A4',
      displayHeaderFooter: true,
      margin: {
          top: '275px',
          right: '15px',
          left: '15px',
          bottom: '110px'
      },
    //   headerTemplate: invoiceHeaderHtml(templateBodyData),
    //   footerTemplate: invoiceFooterHtml(templateBodyData)
  })




  await browser.close();