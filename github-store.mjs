const ROOT = 'https://api.github.com/repos/zunzunzunnn/ae-script';
const FILE = '/contents/scripts.json';
export async function githubError(response) {
  let detail = '';
  try { const body = await response.json(); detail = typeof body.message === 'string' ? body.message : ''; } catch {}
  const header = name => response.headers?.get?.(name);
  const messages = {401:'Token tidak valid atau sudah kedaluwarsa. Klik Ganti token GitHub.',403:'Akses ditolak oleh GitHub. Periksa akses token ke ae-script dan izin Contents: Read and write.',404:'File atau repository tidak ditemukan. Pastikan token memilih repository ae-script.',409:'Koleksi berubah di perangkat lain. Coba lagi.',422:'GitHub menolak perubahan. Periksa aturan branch dan izin token.'};
  let message = messages[response.status] || 'GitHub sedang bermasalah. Coba beberapa saat lagi.';
  if ([403,429].includes(response.status) && (response.status === 429 || header('x-ratelimit-remaining') === '0' || /rate limit|abuse detection/i.test(detail))) {
    const retry = Number(header('retry-after'));
    const reset = Number(header('x-ratelimit-reset'));
    const seconds = retry > 0 ? retry : reset > 0 ? Math.max(1, Math.ceil(reset-Date.now()/1000)) : 60;
    message = 'Batas permintaan GitHub tercapai. Tunggu sekitar ' + Math.ceil(seconds/60) + ' menit sebelum mencoba lagi; izin token tidak perlu diubah.';
  } else if (response.status === 403 && /resource not accessible|not permitted|permission|write access/i.test(detail)) {
    message = 'Token belum memiliki izin untuk operasi ini. Di pengaturan token: Resource owner = zunzunzunnn; Repository access = Only select repositories → ae-script; Repository permissions → Contents = Read and write. Simpan pengaturan, lalu klik Ganti token GitHub dan coba Save lagi.';
  } else if ([403,409,422].includes(response.status) && /protected branch|repository rule|rule violations|pull request/i.test(detail)) {
    message = 'Aturan branch main menolak penyimpanan langsung. Perubahan perlu melalui pull request sesuai aturan repository.';
  }
  const error = new Error(message);
  error.status = response.status;
  return error;
}
export function encode(value) {
  const bytes = new TextEncoder().encode(JSON.stringify(value, null, 2) + '\n');
  if (bytes.length > 950000) throw new Error('Koleksi terlalu besar. Batas penyimpanan koleksi adalah 950 KB.');
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}
export function decode(content) {
  const bytes = Uint8Array.from(atob(content.replace(/\s/g, '')), c => c.charCodeAt(0));
  const value = JSON.parse(new TextDecoder('utf-8', {fatal:true}).decode(bytes));
  if (!Array.isArray(value) || !value.every(x => x && typeof x.id === 'string' && typeof x.title === 'string' && typeof x.code === 'string') || new Set(value.map(x => x.id)).size !== value.length) throw new Error('Format koleksi GitHub tidak valid. Data tidak diubah.');
  return value;
}
export function createStore(fetcher = globalThis.fetch.bind(globalThis)) {
  let token = '';
  async function request(path, options = {}, credential = token) {
    let response;
    try {
      response = await fetcher(ROOT + path, {...options, cache:'no-store', redirect:'error', signal:AbortSignal.timeout(20000), headers:{Accept:'application/vnd.github+json', 'X-GitHub-Api-Version':'2022-11-28', ...(credential ? {Authorization:'Bearer ' + credential} : {}), ...(options.body ? {'Content-Type':'application/json'} : {})}});
    } catch {
      throw new Error(options.method === 'PUT' ? 'Konfirmasi GitHub belum diterima. Coba Save lagi; script yang sama tidak akan digandakan.' : 'GitHub tidak dapat dihubungi. Periksa koneksi lalu coba lagi.');
    }
    if (!response.ok) {
      throw await githubError(response);
    }
    return response.json();
  }
  async function read() {
    const file = await request(FILE + '?ref=main');
    if (file.encoding !== 'base64' || typeof file.content !== 'string' || !file.sha) throw new Error('File koleksi tidak dapat dibaca. Data tidak diubah.');
    return {items:decode(file.content), sha:file.sha};
  }
  return {
    read,
    connected:() => Boolean(token),
    disconnect:() => { token = ''; },
    async connect(value) {
      const candidate = value.trim();
      if (!candidate) throw new Error('Masukkan token GitHub.');
      const repo = await request('', {}, candidate);
      if (!repo.permissions?.push) throw new Error('Akun ini tidak memiliki akses menulis ke ae-script.');
      token = candidate;
    },
    async change(operation) {
      if (!token) throw new Error('Hubungkan GitHub terlebih dahulu untuk menyimpan perubahan.');
      for (let attempt = 0; attempt < 3; attempt++) {
        const {items, sha} = await read();
        let next;
        if (operation.type === 'add') {
          const additions = operation.items.filter(item => !items.some(old => old.id === item.id || (old.title === item.title && old.code === item.code)));
          if (!additions.length) return items;
          next = [...additions, ...items];
        } else if (operation.type === 'delete') {
          next = items.filter(item => item.id !== operation.id);
          if (next.length === items.length) return items;
        } else throw new Error('Operasi tidak dikenal.');
        try {
          await request(FILE, {method:'PUT', body:JSON.stringify({branch:'main', sha, message:operation.type === 'delete' ? 'Delete expression from shelf' : 'Add expressions to shelf', content:encode(next)})});
          return next;
        } catch (error) {
          if (error.status !== 409 || attempt === 2) throw error;
        }
      }
    }
  };
}

