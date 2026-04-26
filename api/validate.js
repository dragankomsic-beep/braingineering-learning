import { put, list } from '@vercel/blob';

const VALID_CODES = new Set([
  '22PZUC','2TUJKR','2YFAVX','34XV5B','3A4YSQ','3D6ZTX','3HD8ZD','3TMV5F','3TTE7V','49C7BZ',
  '49N4SF','4D3BS3','4LZFBB','4TJNRH','4X69VG','4Y44DX','53ZDVF','54B7R9','58DPU8','5HQ8Q2',
  '5NENYZ','5VR6UF','5X7C6W','666HBR','6C5RGA','6QDYZ3','6SBE9V','72SNQM','79SWTZ','7A372R',
  '7B8DT2','7CD8KD','7E7Q5R','7JW5WY','7KTX8M','7L2JZY','829Z65','8544W7','87HZWS','89K54X',
  '8FN9BV','8RVXZV','8S783D','8TYU77','99PL6E','9AMVES','9JAURL','9KAKPQ','9RE3DG','9URCE3',
  'A5DVW9','ADET5K','AFT7LZ','AJ3ZXD','AUTXTS','AVHDF5','AX4KZ8','AZE76P','AZJLNP','BCWX6D',
  'BHJGS7','BQSV2T','BSNSUK','BVVDCC','BXQFP2','C3V53F','CERQAP','CMNJCQ','CQ2YVL','CTJU8M',
  'CTTHLE','CYDQTA','D58D5S','D6E92D','DE2ZMQ','DGHU68','DL4CTE','DSUQJX','DTQKRW','DX35FK',
  'E3VU54','E4L32D','E8JXWX','EC3N6R','EJU73M','EMHSRJ','FD2UEA','FM7Z49','FQNBEP','FV3VTQ',
  'G5EMRN','GAAGXJ','GUH9R2','GVTN63','GW873W','GWCWNS','GWWRKQ','H8UZ8G','HV7GEM','J7DYAH',
  'JC4965','JE6VGN','JEAL9X','JS9DZN','JYCQZ2','JYNQA2','K2VMZN','K3NKPH','KJBRPQ','KKX5BB',
  'KM99WG','KSZNGZ','L9QP96','LFZUAS','LG688U','LKAEFA','LPFLVC','LTRQKK','M2SJKK','M2V52Z',
  'MCHX3L','MEHLJS','MPYAXF','MQCY8R','MTXXLT','MULP9M','NRT5UJ','NUB39C','NUKYZ6','NW4375',
  'NWCRF5','P4BDEJ','P5RR2N','P9SP87','PR4UBU','Q3BSUW','Q57FFY','Q6AD77','Q6JHPX','Q9M2CP',
  'QJ6WGW','QK5LHW','QLRRFC','QLUCUZ','R5EUGE','RBF8L8','RHMVSM','RQ448R','RVVZWD','S6JPKD',
  'S6TS9A','S6YHUX','SFNCA7','SNHB8M','SQYHX7','SRRW55','STCMX6','SYVD8V','T45XGP','T4R5P8',
  'T98ZQZ','U2A8QV','U3XEPW','U4FRAV','UJYL6S','UKVE6V','UQ4JGM','UTP892','UUZXDS','UXJM52',
  'UZCD3Y','V278VA','V7EFCT','VCR7YZ','VD8WJP','VJEM9W','VPS4B5','VRK9BE','VS4TSB','VS99CV',
  'VWDZZC','W6WFTX','WLSKPQ','WMGPD2','WUG7HR','WVGW3Y','WWWKHQ','XGQF4D','XJPJDU','XP9CG3',
  'XRVTXU','XY4XND','Y3YGTY','Y57Q35','Y9C7V4','YD8XUQ','YGNYPQ','YHB8PZ','Z3NMST','ZSCFEQ'
]);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { code, action } = req.body || {};
    if (!code || typeof code !== 'string') {
      return res.status(200).json({ valid: false, error: 'Kein Code eingegeben.' });
    }

    const cleanCode = code.trim().toUpperCase();
    if (!VALID_CODES.has(cleanCode)) {
      return res.status(200).json({ valid: false, error: 'Ungültiger Code.' });
    }

    const prefix = 'used-codes/' + cleanCode;
    const { blobs } = await list({ prefix });
    const isUsed = blobs.length > 0;

    if (action === 'validate') {
      if (isUsed) return res.status(200).json({ valid: false, error: 'Dieser Code wurde bereits verwendet.' });
      return res.status(200).json({ valid: true });
    }

    if (action === 'consume') {
      if (isUsed) return res.status(200).json({ valid: false, error: 'Dieser Code wurde bereits verwendet.' });
      await put(prefix + '.json', JSON.stringify({ code: cleanCode, usedAt: new Date().toISOString() }), { access: 'private', contentType: 'application/json', addRandomSuffix: false });
      return res.status(200).json({ valid: true, consumed: true });
    }

    return res.status(200).json({ error: 'Ungueltige Aktion.' });
  } catch (err) {
    console.error('validate error:', err.message, err.stack);
    return res.status(200).json({ valid: false, error: 'Technischer Fehler: ' + err.message });
  }
}
