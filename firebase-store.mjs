import {initializeApp} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import {getAuth,setPersistence,browserSessionPersistence,signInWithEmailAndPassword,signOut,onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import {getFirestore,collection,doc,getDocsFromServer,query,orderBy,runTransaction,deleteDoc,serverTimestamp} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
export function createStore(){
 let statePromise,admin=false;
 async function state(){
  if(!statePromise)statePromise=(async()=>{
   const response=await fetch('./firebase-config.json',{cache:'no-store'});
   if(!response.ok)throw Error('Konfigurasi Firebase belum tersedia.');
   const config=await response.json();
   if(!config.firebase?.apiKey||!config.firebase?.projectId||!config.adminEmail)throw Error('Konfigurasi Firebase belum lengkap.');
   const app=initializeApp(config.firebase),auth=getAuth(app),db=getFirestore(app);
   await setPersistence(auth,browserSessionPersistence);
   await auth.authStateReady();
   return {auth,db,adminEmail:config.adminEmail};
  })().catch(error=>{statePromise=null;throw error});
  return statePromise;
 }
 function friendly(error){const messages={'auth/invalid-credential':'Password admin salah.','auth/wrong-password':'Password admin salah.','auth/user-not-found':'Akun admin belum tersedia.','auth/too-many-requests':'Terlalu banyak percobaan login. Tunggu sebentar lalu coba lagi.','auth/network-request-failed':'Koneksi terputus. Periksa internet lalu coba lagi.','permission-denied':'Akses admin ditolak. Periksa akun admin dan aturan Firebase.','unavailable':'Firebase belum dapat dihubungi. Coba lagi; draft tetap ada.','auth/operation-not-allowed':'Login password belum diaktifkan di Firebase.'};return new Error(messages[error.code]||error.message||'Operasi belum berhasil. Coba lagi.')}
 async function checkAdmin(auth,adminEmail){return auth.currentUser?.email===adminEmail}
 async function read(){try{const {db}=await state();const snapshot=await getDocsFromServer(query(collection(db,'scripts'),orderBy('createdAt','desc')));return {items:snapshot.docs.map(d=>({id:d.id,title:d.data().title,code:d.data().code}))}}catch(error){throw friendly(error)}}
 return {
  read,
  connected:()=>admin,
  async initialize(callback){try{const {auth,adminEmail}=await state();onAuthStateChanged(auth,async()=>{admin=await checkAdmin(auth,adminEmail);callback()})}catch(error){throw friendly(error)}},
  async connect(password){try{const {auth,adminEmail}=await state();await signInWithEmailAndPassword(auth,adminEmail,password);admin=await checkAdmin(auth,adminEmail);if(!admin){await signOut(auth);throw Error('Akun ini bukan admin koleksi.')} }catch(error){throw friendly(error)}},
  async disconnect(){const {auth}=await state();await signOut(auth);admin=false},
  async change(operation){
   if(!admin)throw Error('Masuk sebagai admin terlebih dahulu.');
   try{const {db}=await state();
    if(operation.type==='delete'){await deleteDoc(doc(db,'scripts',operation.id))}
    else if(operation.type==='add'){
     const items=operation.items;
     if(!Array.isArray(items)||!items.length||items.length>100)throw Error('Maksimal 100 script dalam satu impor.');
     if(!items.every(x=>typeof x.id==='string'&&/^[A-Za-z0-9_-]{1,100}$/.test(x.id)&&typeof x.title==='string'&&x.title.trim()&&x.title.length<=120&&typeof x.code==='string'&&x.code.trim()&&x.code.length<=100000))throw Error('Judul atau isi script tidak valid.');
     await runTransaction(db,async transaction=>{
      const refs=items.map(x=>doc(db,'scripts',x.id));
      const snapshots=await Promise.all(refs.map(ref=>transaction.get(ref)));
      snapshots.forEach((snapshot,index)=>{if(!snapshot.exists())transaction.set(refs[index],{title:items[index].title,code:items[index].code,createdAt:serverTimestamp()});else if(snapshot.data().title!==items[index].title||snapshot.data().code!==items[index].code)throw Error('ID script sudah dipakai. Tambahkan ulang dengan judul dan isi yang diinginkan.');});
     });
    }else throw Error('Operasi tidak dikenal.');
    return (await read()).items;
   }catch(error){throw friendly(error)}
  }
 };
}

