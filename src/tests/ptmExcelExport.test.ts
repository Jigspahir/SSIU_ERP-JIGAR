import ExcelJS from 'exceljs';
import { SWARRNIM_LOGO_PNG_BASE64 } from '../assets/logoBase64';

async function testExcelGeneration() {
  console.log('--- TESTING EXCELJS UNIVERSITY PTM REPORT ENGINE ---');
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'SSIU ERP Academic Cell';
  
  const sheet1 = workbook.addWorksheet('PTM Master Report', {
    pageSetup: {
      orientation: 'landscape',
      paperSize: 9,
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      printTitlesRow: '11:11'
    }
  });

  // Test adding base64 image
  try {
    const base64Data = SWARRNIM_LOGO_PNG_BASE64.replace(/^data:image\/\w+;base64,/, '');
    const logoId = workbook.addImage({
      base64: base64Data,
      extension: 'png'
    });

    sheet1.addImage(logoId, {
      tl: { col: 0.1, row: 0.1 },
      ext: { width: 120, height: 40 }
    });
    console.log('✓ University logo embedded successfully into worksheet.');
  } catch (err) {
    console.error('Error embedding logo:', err);
  }

  // Add sample titles
  sheet1.mergeCells('C1:N1');
  const titleCell = sheet1.getCell('C1');
  titleCell.value = 'SWARRNIM STARTUP & INNOVATION UNIVERSITY';
  titleCell.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FF001F3F' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  sheet1.mergeCells('C2:N2');
  const subTitleCell = sheet1.getCell('C2');
  subTitleCell.value = 'PARENT–TEACHER MEETING (PTM) REPORT';
  subTitleCell.font = { name: 'Calibri', size: 13, bold: true, color: { argb: 'FFF37023' } };
  subTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  const buffer = await workbook.xlsx.writeBuffer();
  console.log(`✓ Workbook created successfully, buffer size: ${buffer.byteLength} bytes.`);
}

testExcelGeneration()
  .then(() => console.log('✅ EXCEL GENERATION TEST COMPLETED SUCCESSFULLY'))
  .catch(err => {
    console.error('❌ FAILED:', err);
    process.exit(1);
  });
