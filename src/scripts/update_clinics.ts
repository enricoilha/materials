function fixEncodingIssues(text) {
    if (!text) return text;
    
    return text
      // Common patterns with special characters
      .replace(/GUAPOR�/g, 'GUAPORÉ')
      .replace(/HIGIEN�POLIS/g, 'HIGIENÓPOLIS')
      .replace(/JOS�/g, 'JOSÉ')
      .replace(/PRA�A/g, 'PRAÇA')
      .replace(/S�O/g, 'SÃO')
      .replace(/JO�O/g, 'JOÃO')
      .replace(/EXPEDITION�RIOS/g, 'EXPEDICIONÁRIOS')
      .replace(/INDEPEND�NCIA/g, 'INDEPENDÊNCIA')
      .replace(/MARANH�O/g, 'MARANHÃO')
      .replace(/CAMAR�ES/g, 'CAMARÕES')
      .replace(/ANT�NIO/g, 'ANTÔNIO')
      .replace(/AN�LIA/g, 'ANÁLIA')
      .replace(/LEF�VRE/g, 'LEFÈVRE')
      .replace(/BONIF�CIO/g, 'BONIFÁCIO')
      .replace(/J�NIOR/g, 'JÚNIOR')
      .replace(/TE�FILO/g, 'TEÓFILO')
      .replace(/BRAGN�A/g, 'BRAGANÇA')
      .replace(/NA��ES/g, 'NAÇÕES')
      .replace(/FOGA�A/g, 'FOGAÇA')
      .replace(/HIST�RICO/g, 'HISTÓRICO')
      .replace(/RIBEIR�O/g, 'RIBEIRÃO')
      .replace(/ARA�ATUBA/g, 'ARAÇATUBA')
      .replace(/SARA�VA/g, 'SARAIVA')
      
      // Individual character replacements
      .replace(/�/g, 'é')
      .replace(/�/g, 'ó')
      .replace(/�/g, 'ç')
      .replace(/�/g, 'ã')
      .replace(/�/g, 'á')
      .replace(/�/g, 'ê')
      .replace(/�/g, 'í')
      .replace(/�/g, 'ô')
      .replace(/�/g, 'ú')
      .replace(/�/g, 'à')
      .replace(/�/g, 'Á')
      .replace(/�/g, 'Ó')
      .replace(/�/g, 'Ç');
  }function fixEncodingIssues(text) {
    if (!text) return text;
    
    return text
      // Common patterns with special characters
      .replace(/GUAPOR�/g, 'GUAPORÉ')
      .replace(/HIGIEN�POLIS/g, 'HIGIENÓPOLIS')
      .replace(/JOS�/g, 'JOSÉ')
      .replace(/PRA�A/g, 'PRAÇA')
      .replace(/S�O/g, 'SÃO')
      .replace(/JO�O/g, 'JOÃO')
      .replace(/EXPEDITION�RIOS/g, 'EXPEDICIONÁRIOS')
      .replace(/INDEPEND�NCIA/g, 'INDEPENDÊNCIA')
      .replace(/MARANH�O/g, 'MARANHÃO')
      .replace(/CAMAR�ES/g, 'CAMARÕES')
      .replace(/ANT�NIO/g, 'ANTÔNIO')
      .replace(/AN�LIA/g, 'ANÁLIA')
      .replace(/LEF�VRE/g, 'LEFÈVRE')
      .replace(/BONIF�CIO/g, 'BONIFÁCIO')
      .replace(/J�NIOR/g, 'JÚNIOR')
      .replace(/TE�FILO/g, 'TEÓFILO')
      .replace(/BRAGN�A/g, 'BRAGANÇA')
      .replace(/NA��ES/g, 'NAÇÕES')
      .replace(/FOGA�A/g, 'FOGAÇA')
      .replace(/HIST�RICO/g, 'HISTÓRICO')
      .replace(/RIBEIR�O/g, 'RIBEIRÃO')
      .replace(/ARA�ATUBA/g, 'ARAÇATUBA')
      .replace(/SARA�VA/g, 'SARAIVA')
      
      // Individual character replacements
      .replace(/�/g, 'é')
      .replace(/�/g, 'ó')
      .replace(/�/g, 'ç')
      .replace(/�/g, 'ã')
      .replace(/�/g, 'á')
      .replace(/�/g, 'ê')
      .replace(/�/g, 'í')
      .replace(/�/g, 'ô')
      .replace(/�/g, 'ú')
      .replace(/�/g, 'à')
      .replace(/�/g, 'Á')
      .replace(/�/g, 'Ó')
      .replace(/�/g, 'Ç');
  }


import { supabase } from '@/lib/supabase';
// import fs from 'fs/promises';

// // Read the original CSV
// (async () => {
//     const originalContent = await fs.readFile('src/scripts/clinicas_rows_1.csv', 'utf-8');

// // Apply the fix to each line
// const fixedContent = originalContent.split('\n')
//   .map(line => fixEncodingIssues(line))
//   .join('\n');

// // Write the fixed content to a new file
// await fs.writeFile('clinicas_rows_fixed.csv', fixedContent, 'utf-8');
// console.log('CSV file fixed successfully!');
// })()

import fs from 'fs/promises';
import Papa from 'papaparse';

(async () => {
    const originalContent = await fs.readFile('clinicas_rows_fixed.csv', 'utf-8');
    const parsedData: any = Papa.parse(originalContent, {
        header: true,        // Treat first row as headers
        skipEmptyLines: true // Skip empty lines
      });
      
      // Then loop through each record and update
      for (const clinic of parsedData.data) {
        // Make sure ID is a number
        const id = parseInt(clinic.id, 10);
        
        // Update database
        const { data, error } = await supabase
          .from("clinicas")
          .update({ endereco: clinic.endereco })
          .eq("id", id);
      }
})()