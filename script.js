// 1) Importer Firebase depuis Internet
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
  signOut,
  updateProfile,
  deleteUser
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  setDoc,
  getDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  increment,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

console.log("Jacq appli : script chargé");

// 2) Configuration de ton projet Jacq appli
const firebaseConfig = {
  apiKey: "AIzaSyA7SK6clLBXNSeY3XGV0SIFmWKWcttwI5E",
  authDomain: "jacq-appli-4e630.firebaseapp.com",
  projectId: "jacq-appli-4e630",
  storageBucket: "jacq-appli-4e630.firebasestorage.app",
  messagingSenderId: "380703153465",
  appId: "1:380703153465:web:119b7af173b2cb68f19ce8"
};

// 3) Démarrer Firebase : comptes + base de données
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 4) Retrouver les éléments de la page
const ecranAuth = document.getElementById("ecran-auth");
const ecranVerif = document.getElementById("ecran-verif");
const ecranListe = document.getElementById("ecran-liste");
const ecranConv = document.getElementById("ecran-conv");
const toast = document.getElementById("toast");

const formAuth = document.getElementById("form-auth");
const titreAuth = document.getElementById("titre-auth");
const champPseudo = document.getElementById("auth-pseudo");
const champEmail = document.getElementById("auth-email");
const champMdp = document.getElementById("auth-mdp");
const messageErreur = document.getElementById("auth-erreur");
const messageInfo = document.getElementById("auth-info");
const boutonAuth = document.getElementById("auth-bouton");
const boutonOublie = document.getElementById("auth-oublie");
const boutonBascule = document.getElementById("auth-bascule");

const verifEmail = document.getElementById("verif-email");
const verifErreur = document.getElementById("verif-erreur");
const verifInfo = document.getElementById("verif-info");
const boutonVerifOk = document.getElementById("verif-ok");
const boutonRenvoyer = document.getElementById("verif-renvoyer");
const boutonVerifQuitter = document.getElementById("verif-quitter");

const boutonProfil = document.getElementById("btn-profil");
const panneauProfil = document.getElementById("panneau-profil");
const formProfil = document.getElementById("form-profil");
const champProfil = document.getElementById("champ-profil");
const messageProfil = document.getElementById("message-profil");
const boutonTheme = document.getElementById("btn-theme");
const boutonQuitter = document.getElementById("btn-quitter");
const formAmi = document.getElementById("form-ami");
const champAmi = document.getElementById("champ-ami");
const messageAmi = document.getElementById("message-ami");
const boutonInviter = document.getElementById("btn-inviter");
const champRecherche = document.getElementById("champ-recherche");
const listeVide = document.getElementById("liste-vide");
const listeConv = document.getElementById("liste-conv");
const boutonPlus = document.getElementById("btn-plus");

const feuille = document.getElementById("feuille");
const feuilleFond = document.getElementById("feuille-fond");
const feuilleTitre = document.getElementById("feuille-titre");
const actEpingler = document.getElementById("act-epingler");
const actBloquer = document.getElementById("act-bloquer");
const actSupprimer = document.getElementById("act-supprimer");
const actAnnuler = document.getElementById("act-annuler");

const boutonRetour = document.getElementById("btn-retour");
const boutonMenuConv = document.getElementById("btn-menu-conv");
const avatarConv = document.getElementById("avatar-conv");
const titreConv = document.getElementById("titre-conv");
const statutConv = document.getElementById("statut-conv");
const zoneMessages = document.getElementById("messages");
const barreContexte = document.getElementById("barre-contexte");
const contexteTitre = document.getElementById("contexte-titre");
const contexteCorps = document.getElementById("contexte-corps");
const contexteFermer = document.getElementById("contexte-fermer");
const panneauEmojis = document.getElementById("panneau-emojis");
const barreBloque = document.getElementById("barre-bloque");
const boutonEmoji = document.getElementById("btn-emoji");
const formulaire = document.getElementById("form-message");
const champTexte = document.getElementById("texte");

// 5) Variables qui décrivent la situation
let monId = null;
let pseudo = "";
let monEmail = "";
let convActuelle = null;
let autreIdActuel = null;
let arreterListe = null;
let arreterMessages = null;
let arreterConv = null;
let arreterStatut = null;
let minuteurStatut = null;
let minuteurBattement = null;
let inscriptionEnCours = false;
let nouveauCompte = false;
let controleEnCours = false;
let dernierRenvoi = 0;
let mode = "connexion";
let conversations = [];
let messagesActuels = [];
let infosConv = null;
let statutAmi = null;
let messageOuvert = null;
let feuilleConv = null;
let forcerBas = true;
let minuteurToast = null;
let reponseA = null;
let enModification = null;
let derniereFrappe = 0;
let envois = [];

// MESSAGE DE BIENVENUE : modifie ces deux phrases pour changer le texte
const BIENVENUE_CONNEXION = "Bienvenue sur Jacq appli, l'application de Jacques 👋";
const BIENVENUE_INSCRIPTION = "Compte créé ! Bienvenue sur Jacq appli, l'application de Jacques 🎉";

// LIEN D'INVITATION : le lien de ton application, envoyé à tes amis
const LIEN_APPLICATION = ""; // vide = on utilise automatiquement l'adresse de la page

// Réglages
const DELAI_MODIFICATION = 15 * 60 * 1000;
const ENVOIS_MAX = 6;
const FENETRE_ENVOIS = 10000;
const ECART_MIN_ENVOIS = 600;

// 6) Mémoire du navigateur (avec protection contre les erreurs)
function lire(cle) {
  try { return localStorage.getItem(cle); } catch (e) { return null; }
}
function ecrire(cle, valeur) {
  try { localStorage.setItem(cle, valeur); } catch (e) {}
}

// 7) Petite bulle d'information
function notifier(texte) {
  toast.textContent = texte;
  toast.classList.remove("cache");
  clearTimeout(minuteurToast);
  minuteurToast = setTimeout(() => toast.classList.add("cache"), 4500);
}

// 8) Mode sombre
let sombre = lire("jacq_sombre") === "1";

function appliquerTheme() {
  document.body.classList.toggle("sombre", sombre);
  boutonTheme.textContent = sombre ? "☀️ Mode clair" : "🌙 Mode sombre";
}

boutonTheme.addEventListener("click", () => {
  sombre = !sombre;
  ecrire("jacq_sombre", sombre ? "1" : "0");
  appliquerTheme();
});

appliquerTheme();

// 9) Couleurs et initiales des avatars
const COULEURS = [
  "#075e54", "#d1496b", "#c26a1a", "#3d7ea6",
  "#7b4fb5", "#2e8b57", "#b5444d", "#5a6b7a"
];

function couleurPour(texte) {
  let h = 0;
  for (let i = 0; i < texte.length; i++) {
    h = (h * 31 + texte.charCodeAt(i)) % 100000;
  }
  return COULEURS[h % COULEURS.length];
}

function remplirAvatar(element, nom, id) {
  element.textContent = (nom || "?").charAt(0).toUpperCase();
  element.style.background = couleurPour(id || nom || "?");
}

// 10) Dates et heures
function deux(x) {
  return String(x).padStart(2, "0");
}

function millis(ts) {
  return ts && ts.toMillis ? ts.toMillis() : Date.now();
}

function millisReel(ts) {
  return ts && ts.toMillis ? ts.toMillis() : 0;
}

function memeJour(a, b) {
  return a.toDateString() === b.toDateString();
}

function formaterHeure(ts) {
  if (!ts || !ts.toDate) return "";
  const d = ts.toDate();
  return deux(d.getHours()) + ":" + deux(d.getMinutes());
}

function formaterListe(ts) {
  if (!ts || !ts.toDate) return "";
  const d = ts.toDate();
  const n = new Date();
  if (memeJour(d, n)) return formaterHeure(ts);
  const hier = new Date();
  hier.setDate(n.getDate() - 1);
  if (memeJour(d, hier)) return "Hier";
  return deux(d.getDate()) + "/" + deux(d.getMonth() + 1);
}

function libelleJour(date) {
  const n = new Date();
  if (memeJour(date, n)) return "Aujourd'hui";
  const hier = new Date();
  hier.setDate(n.getDate() - 1);
  if (memeJour(date, hier)) return "Hier";
  return deux(date.getDate()) + "/" + deux(date.getMonth() + 1) + "/" + date.getFullYear();
}

// 11) Pseudos : validité et clé unique
function clePseudo(p) {
  return p.trim().toLowerCase().replace(/\s+/g, "_");
}

function pseudoValide(p) {
  const t = p.trim();
  if (t.length < 2 || t.length > 20) {
    return "Le pseudo doit faire entre 2 et 20 caractères.";
  }
  if (!/^[\p{L}\p{N}_.\- ]+$/u.test(t)) {
    return "Pseudo : lettres, chiffres, espaces, _ . - seulement.";
  }
  if (!/[\p{L}\p{N}]/u.test(t)) {
    return "Le pseudo doit contenir au moins une lettre ou un chiffre.";
  }
  if (clePseudo(t).startsWith("__")) {
    return "Ce pseudo n'est pas autorisé.";
  }
  return "";
}

// 12) Liens cliquables dans les messages
const MOTIF_LIEN = /((?:https?:\/\/|www\.)[^\s<>"]+)/gi;

function remplirTexte(element, texte) {
  element.textContent = "";
  let position = 0;

  for (const m of texte.matchAll(MOTIF_LIEN)) {
    let lien = m[0];
    const ponctuation = lien.match(/[.,;:!?)\]]+$/);
    if (ponctuation) lien = lien.slice(0, lien.length - ponctuation[0].length);
    if (!lien) continue;

    if (m.index > position) {
      element.appendChild(document.createTextNode(texte.slice(position, m.index)));
    }

    const a = document.createElement("a");
    a.href = /^www\./i.test(lien) ? "https://" + lien : lien;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = lien;
    a.addEventListener("click", (e) => e.stopPropagation());
    element.appendChild(a);

    position = m.index + lien.length;
  }

  if (position < texte.length) {
    element.appendChild(document.createTextNode(texte.slice(position)));
  }
}

// 13) Copier un message
async function copierTexte(texte) {
  try {
    await navigator.clipboard.writeText(texte);
    notifier("Message copié");
    return;
  } catch (e) {}

  try {
    const zone = document.createElement("textarea");
    zone.value = texte;
    zone.style.position = "fixed";
    zone.style.opacity = "0";
    document.body.appendChild(zone);
    zone.focus();
    zone.select();
    zone.setSelectionRange(0, texte.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(zone);
    notifier(ok ? "Message copié" : "Copie impossible ici");
  } catch (e) {
    notifier("Copie impossible ici");
  }
}

// 14) Émojis
const EMOJIS = [
  "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣",
  "😊", "😇", "🙂", "😉", "😍", "🥰", "😘", "😋",
  "😜", "🤪", "😎", "🤩", "🥳", "😏", "😒", "😞",
  "😔", "😢", "😭", "😤", "😡", "🤯", "😱", "😴",
  "🤔", "🤗", "🙄", "😬", "🤐", "😷", "🤒", "🥶",
  "👍", "👎", "👏", "🙌", "🙏", "💪", "👋", "🤝",
  "✌️", "🤞", "👌", "❤️", "🧡", "💛", "💚", "💙",
  "💜", "🖤", "💔", "🔥", "✨", "🎉", "🎂", "🎁",
  "💯", "✅", "❌", "⚡", "🌹", "☀️", "🌙", "⭐",
  "🍕", "🍔", "☕", "⚽", "🎵", "📱", "💰", "🚀"
];

EMOJIS.forEach((e) => {
  const bouton = document.createElement("button");
  bouton.type = "button";
  bouton.textContent = e;
  bouton.addEventListener("click", () => insererEmoji(e));
  panneauEmojis.appendChild(bouton);
});

function insererEmoji(e) {
  const debut = champTexte.selectionStart != null
    ? champTexte.selectionStart
    : champTexte.value.length;
  const fin = champTexte.selectionEnd != null ? champTexte.selectionEnd : debut;
  champTexte.value = champTexte.value.slice(0, debut) + e + champTexte.value.slice(fin);
  const position = debut + e.length;
  try { champTexte.setSelectionRange(position, position); } catch (err) {}
}

boutonEmoji.addEventListener("click", () => {
  panneauEmojis.classList.toggle("cache");
});

// 15) Montrer un seul écran à la fois
function montrer(nom) {
  ecranAuth.classList.toggle("cache", nom !== "auth");
  ecranVerif.classList.toggle("cache", nom !== "verif");
  ecranListe.classList.toggle("cache", nom !== "liste");
  ecranConv.classList.toggle("cache", nom !== "conv");
}

function arreterConversation() {
  if (arreterMessages) { arreterMessages(); arreterMessages = null; }
  if (arreterConv) { arreterConv(); arreterConv = null; }
  if (arreterStatut) { arreterStatut(); arreterStatut = null; }
  if (minuteurStatut) { clearInterval(minuteurStatut); minuteurStatut = null; }
  convActuelle = null;
  autreIdActuel = null;
  infosConv = null;
  statutAmi = null;
  messagesActuels = [];
  messageOuvert = null;
  derniereFrappe = 0;
  effacerContexte();
  panneauEmojis.classList.add("cache");
  formulaire.classList.remove("cache");
  barreBloque.classList.add("cache");
}

function toutArreter() {
  if (arreterListe) { arreterListe(); arreterListe = null; }
  arreterConversation();
}

// 16) Blocage
function jaiBloque() {
  return !!(infosConv && infosConv["bloque_" + monId]);
}

function ilMaBloque() {
  return !!(infosConv && autreIdActuel && infosConv["bloque_" + autreIdActuel]);
}

function majBlocage() {
  const bloque = jaiBloque();
  formulaire.classList.toggle("cache", bloque);
  barreBloque.classList.toggle("cache", !bloque);
  if (bloque) {
    panneauEmojis.classList.add("cache");
    effacerContexte();
  }
}

// 17) Dernière connexion : "en ligne" ou "vu à ..."
async function battement() {
  if (!monId || document.visibilityState !== "visible") return;
  try {
    await setDoc(doc(db, "users", monId), { vuLe: serverTimestamp() }, { merge: true });
  } catch (erreur) {
    console.error(erreur);
  }
}

function demarrerBattement() {
  arreterBattement();
  battement();
  minuteurBattement = setInterval(battement, 60000);
}

function arreterBattement() {
  if (minuteurBattement) {
    clearInterval(minuteurBattement);
    minuteurBattement = null;
  }
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState !== "visible") return;
  battement();
  if (!ecranVerif.classList.contains("cache")) controlerVerification(false);
});

function texteStatut() {
  if (jaiBloque() || ilMaBloque()) return "";

  if (infosConv && infosConv.ecrit && autreIdActuel) {
    const frappe = millisReel(infosConv.ecrit[autreIdActuel]);
    if (frappe && Date.now() - frappe < 6000) return "en train d'écrire…";
  }

  const t = millisReel(statutAmi);
  if (!t) return "";
  if (Date.now() - t < 150000) return "en ligne";

  const d = new Date(t);
  const n = new Date();
  const heure = deux(d.getHours()) + ":" + deux(d.getMinutes());
  if (memeJour(d, n)) return "vu aujourd'hui à " + heure;

  const hier = new Date();
  hier.setDate(n.getDate() - 1);
  if (memeJour(d, hier)) return "vu hier à " + heure;

  return "vu le " + deux(d.getDate()) + "/" + deux(d.getMonth() + 1);
}

// 18) Écran de connexion : mode connexion ou inscription
function appliquerMode() {
  const inscription = mode === "inscription";
  champPseudo.classList.toggle("cache", !inscription);
  champPseudo.required = inscription;
  boutonOublie.classList.toggle("cache", inscription);
  titreAuth.textContent = inscription ? "Crée ton compte" : "Connecte-toi";
  boutonAuth.textContent = inscription ? "Créer mon compte" : "Se connecter";
  boutonBascule.textContent = inscription
    ? "J'ai déjà un compte"
    : "Pas de compte ? Créer un compte";
  champMdp.autocomplete = inscription ? "new-password" : "current-password";
  messageErreur.textContent = "";
  messageInfo.textContent = "";
}

appliquerMode();

boutonBascule.addEventListener("click", () => {
  mode = mode === "connexion" ? "inscription" : "connexion";
  appliquerMode();
});

function expliquerErreur(erreur) {
  switch (erreur.code) {
    case "auth/email-already-in-use":
      return "Cet e-mail a déjà un compte. Choisis « J'ai déjà un compte ».";
    case "auth/invalid-email":
      return "Cet e-mail n'est pas valide.";
    case "auth/weak-password":
      return "Mot de passe trop faible : 6 caractères minimum.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "E-mail ou mot de passe incorrect.";
    case "auth/network-request-failed":
      return "Pas de connexion Internet.";
    case "auth/too-many-requests":
      return "Trop d'essais. Réessaie dans quelques minutes.";
    case "app/pseudo-pris":
      return "Ce pseudo n'est pas disponible. Choisis-en un autre.";
    default:
      return "Erreur : " + erreur.message;
  }
}

// 19) Mot de passe oublié
boutonOublie.addEventListener("click", async () => {
  messageErreur.textContent = "";
  messageInfo.textContent = "";
  const email = champEmail.value.trim();
  if (!email) {
    messageErreur.textContent = "Tape d'abord ton e-mail dans le champ ci-dessus.";
    return;
  }
  try {
    await sendPasswordResetEmail(auth, email);
    messageInfo.textContent =
      "Si un compte existe avec cet e-mail, un message de réinitialisation vient d'être envoyé. Pense à vérifier tes courriers indésirables.";
  } catch (erreur) {
    console.error(erreur);
    messageErreur.textContent = expliquerErreur(erreur);
  }
});

// 20) Inscription ou connexion
formAuth.addEventListener("submit", async (e) => {
  e.preventDefault();
  messageErreur.textContent = "";
  messageInfo.textContent = "";
  boutonAuth.disabled = true;

  const email = champEmail.value.trim();
  const mdp = champMdp.value;

  try {
    if (mode === "inscription") {
      const saisi = champPseudo.value.trim();
      const probleme = pseudoValide(saisi);
      if (probleme) {
        messageErreur.textContent = probleme;
        return;
      }

      const cle = clePseudo(saisi);
      let pris = false;
      try {
        pris = (await getDoc(doc(db, "pseudos", cle))).exists();
      } catch (erreur) {
        console.error(erreur);
      }
      if (pris) {
        messageErreur.textContent = "Ce pseudo est déjà pris. Choisis-en un autre.";
        return;
      }

      inscriptionEnCours = true;
      const cred = await createUserWithEmailAndPassword(auth, email, mdp);

      try {
        await setDoc(doc(db, "pseudos", cle), { uid: cred.user.uid });
      } catch (erreur) {
        console.error(erreur);
        await deleteUser(cred.user).catch(() => {});
        const err = new Error("pseudo pris");
        err.code = "app/pseudo-pris";
        throw err;
      }

      await updateProfile(cred.user, { displayName: saisi });
      nouveauCompte = true;
      afficherVerification(cred.user);
      await envoyerVerification(cred.user);
    } else {
      await signInWithEmailAndPassword(auth, email, mdp);
    }
  } catch (erreur) {
    console.error(erreur);
    messageErreur.textContent = expliquerErreur(erreur);
  } finally {
    inscriptionEnCours = false;
    boutonAuth.disabled = false;
  }
});

boutonQuitter.addEventListener("click", () => {
  signOut(auth);
});

// 21) Vérification de l'e-mail
function afficherVerification(user) {
  toutArreter();
  arreterBattement();
  fermerPanneaux();
  fermerFeuille();
  monId = null;
  verifEmail.textContent = user.email || "";
  verifErreur.textContent = "";
  verifInfo.textContent = "";
  montrer("verif");
}

async function envoyerVerification(user) {
  try {
    await sendEmailVerification(user);
    ecrire("jacq_verif_" + user.uid, "1");
    dernierRenvoi = Date.now();
    verifErreur.textContent = "";
    verifInfo.textContent =
      "Un e-mail de confirmation vient d'être envoyé à " + user.email + ".";
  } catch (erreur) {
    console.error(erreur);
    verifErreur.textContent = expliquerErreur(erreur);
  }
}

async function controlerVerification(avecMessage) {
  const user = auth.currentUser;
  if (!user || controleEnCours) return;
  controleEnCours = true;

  try {
    await user.reload();
    if (!user.emailVerified) {
      if (avecMessage) {
        verifInfo.textContent = "";
        verifErreur.textContent =
          "Ton e-mail n'est pas encore confirmé. Ouvre le message reçu, appuie sur le lien, puis reviens ici.";
      }
      return;
    }
    await user.getIdToken(true);
    await entrer(auth.currentUser);
  } catch (erreur) {
    console.error(erreur);
    if (avecMessage) verifErreur.textContent = expliquerErreur(erreur);
  } finally {
    controleEnCours = false;
  }
}

boutonVerifOk.addEventListener("click", () => controlerVerification(true));

boutonRenvoyer.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;
  verifErreur.textContent = "";
  verifInfo.textContent = "";
  if (Date.now() - dernierRenvoi < 30000) {
    verifErreur.textContent = "Attends quelques secondes avant de renvoyer.";
    return;
  }
  await envoyerVerification(user);
});

boutonVerifQuitter.addEventListener("click", () => {
  signOut(auth);
});

// 22) Entrer dans l'application (compte vérifié)
async function entrer(user) {
  monId = user.uid;
  pseudo = user.displayName || "Sans pseudo";
  monEmail = (user.email || "").toLowerCase();

  try {
    await setDoc(doc(db, "users", monId), {
      pseudo: pseudo,
      email: monEmail
    }, { merge: true });
  } catch (erreur) {
    console.error(erreur);
  }

  const message = nouveauCompte ? BIENVENUE_INSCRIPTION : BIENVENUE_CONNEXION;
  nouveauCompte = false;
  ouvrirListe(message);
  verifierPseudoReserve();
}

function demanderChangementPseudo(texte) {
  setTimeout(() => {
    notifier(texte);
    champProfil.value = pseudo;
    messageProfil.textContent = texte;
    panneauProfil.classList.remove("cache");
  }, 1500);
}

async function verifierPseudoReserve() {
  const probleme = pseudoValide(pseudo);
  if (probleme) {
    demanderChangementPseudo(probleme + " Change ton pseudo.");
    return;
  }

  try {
    const ref = doc(db, "pseudos", clePseudo(pseudo));
    const s = await getDoc(ref);
    if (!s.exists()) {
      await setDoc(ref, { uid: monId });
    } else if (s.data().uid !== monId) {
      demanderChangementPseudo(
        "Le pseudo « " + pseudo + " » est déjà pris par quelqu'un d'autre. Choisis-en un nouveau."
      );
    }
  } catch (erreur) {
    console.error(erreur);
  }
}

// 23) Liste des discussions (en temps réel)
function ouvrirListe(messageBienvenue) {
  toutArreter();
  boutonProfil.textContent = "👤 " + pseudo;
  champMdp.value = "";
  champRecherche.value = "";
  fermerPanneaux();
  fermerFeuille();
  montrer("liste");
  demarrerBattement();

  if (messageBienvenue) notifier(messageBienvenue);

  const requete = query(
    collection(db, "conversations"),
    where("participants", "array-contains", monId)
  );

  arreterListe = onSnapshot(requete, (instantane) => {
    conversations = [];
    instantane.forEach((d) => {
      const c = d.data();
      const efface = millisReel(c.effaces && c.effaces[monId]);
      const visible = c.dernierTexte &&
        (!efface || !c.dernierDate || millisReel(c.dernierDate) > efface);
      if (visible) conversations.push({ id: d.id, ...c });
    });

    conversations.sort((a, b) => {
      const pa = a.epingles && a.epingles[monId] ? 1 : 0;
      const pb = b.epingles && b.epingles[monId] ? 1 : 0;
      if (pa !== pb) return pb - pa;
      return millis(b.dernierDate) - millis(a.dernierDate);
    });

    dessinerListe();
  }, (erreur) => {
    console.error(erreur);
    notifier("Erreur de lecture : " + erreur.message);
  });
}

function dessinerListe() {
  const filtre = champRecherche.value.trim().toLowerCase();
  listeConv.innerHTML = "";
  let affiches = 0;

  conversations.forEach((c) => {
    const autreId = c.participants.find((p) => p !== monId);
    const nom = (c.noms && c.noms[autreId]) || "Ami";
    if (filtre && !nom.toLowerCase().includes(filtre)) return;
    affiches++;

    const nonLus = (c.nonLus && c.nonLus[monId]) || 0;
    const epingle = !!(c.epingles && c.epingles[monId]);
    const bloque = !!c["bloque_" + monId];

    const ligne = document.createElement("div");
    ligne.className = "conv-item";

    const avatar = document.createElement("div");
    avatar.className = "conv-avatar";
    remplirAvatar(avatar, nom, autreId);

    const corps = document.createElement("div");
    corps.className = "conv-corps";

    const haut = document.createElement("div");
    haut.className = "conv-ligne";
    const nomEl = document.createElement("span");
    nomEl.className = "conv-nom";
    nomEl.textContent = nom;
    const heure = document.createElement("span");
    heure.className = "conv-heure" + (nonLus > 0 ? " neuf" : "");
    heure.textContent = formaterListe(c.dernierDate);
    haut.appendChild(nomEl);
    haut.appendChild(heure);

    const bas = document.createElement("div");
    bas.className = "conv-bas";
    const texte = document.createElement("div");
    texte.className = "conv-texte";
    texte.textContent = (c.dernierAuteur === monId ? "Toi : " : "") + c.dernierTexte;
    bas.appendChild(texte);

    if (bloque) {
      const icone = document.createElement("span");
      icone.className = "conv-pin";
      icone.textContent = "🚫";
      bas.appendChild(icone);
    }

    if (epingle) {
      const pin = document.createElement("span");
      pin.className = "conv-pin";
      pin.textContent = "📌";
      bas.appendChild(pin);
    }

    if (nonLus > 0) {
      const badge = document.createElement("span");
      badge.className = "conv-badge";
      badge.textContent = nonLus > 99 ? "99+" : String(nonLus);
      bas.appendChild(badge);
    }

    corps.appendChild(haut);
    corps.appendChild(bas);

    const menu = document.createElement("button");
    menu.type = "button";
    menu.className = "conv-menu";
    menu.textContent = "⋮";
    menu.addEventListener("click", (e) => {
      e.stopPropagation();
      ouvrirFeuille(c, nom);
    });

    ligne.appendChild(avatar);
    ligne.appendChild(corps);
    ligne.appendChild(menu);

    ligne.addEventListener("click", () => afficherConversation(c.id, nom, autreId));
    listeConv.appendChild(ligne);
  });

  if (affiches === 0) {
    listeVide.textContent = conversations.length === 0
      ? "Aucune discussion pour l'instant. Appuie sur + pour ajouter un ami."
      : "Aucune discussion ne correspond à ta recherche.";
    listeVide.classList.remove("cache");
  } else {
    listeVide.classList.add("cache");
  }
}

champRecherche.addEventListener("input", dessinerListe);

// 24) Menu d'une discussion : épingler, bloquer, supprimer
function ouvrirFeuille(c, nom) {
  feuilleConv = c;
  feuilleTitre.textContent = nom;
  const epingle = !!(c.epingles && c.epingles[monId]);
  const bloque = !!c["bloque_" + monId];
  actEpingler.textContent = epingle ? "📌 Désépingler" : "📌 Épingler en haut";
  actBloquer.textContent = bloque ? "✅ Débloquer ce contact" : "🚫 Bloquer ce contact";
  feuille.classList.remove("cache");
}

function fermerFeuille() {
  feuille.classList.add("cache");
  feuilleConv = null;
}

feuilleFond.addEventListener("click", fermerFeuille);
actAnnuler.addEventListener("click", fermerFeuille);

boutonMenuConv.addEventListener("click", () => {
  if (!convActuelle) return;
  const base = infosConv || { participants: [monId, autreIdActuel] };
  ouvrirFeuille({ id: convActuelle, ...base }, titreConv.textContent);
});

actEpingler.addEventListener("click", async () => {
  const c = feuilleConv;
  if (!c) return;
  fermerFeuille();

  const dejaEpingle = !!(c.epingles && c.epingles[monId]);
  if (!dejaEpingle) {
    const total = conversations.filter((x) => x.epingles && x.epingles[monId]).length;
    if (total >= 3) {
      notifier("Tu ne peux épingler que 3 discussions.");
      return;
    }
  }

  try {
    await setDoc(doc(db, "conversations", c.id),
      { epingles: { [monId]: !dejaEpingle } }, { merge: true });
  } catch (erreur) {
    console.error(erreur);
    notifier("Erreur : " + erreur.message);
  }
});

actBloquer.addEventListener("click", async () => {
  const c = feuilleConv;
  if (!c) return;
  fermerFeuille();

  const cle = "bloque_" + monId;
  const dejaBloque = !!c[cle];

  try {
    await setDoc(doc(db, "conversations", c.id), { [cle]: !dejaBloque }, { merge: true });
    notifier(dejaBloque ? "Contact débloqué" : "Contact bloqué");
  } catch (erreur) {
    console.error(erreur);
    notifier("Erreur : " + erreur.message);
  }
});

actSupprimer.addEventListener("click", async () => {
  const c = feuilleConv;
  if (!c) return;
  fermerFeuille();

  try {
    await setDoc(doc(db, "conversations", c.id), {
      effaces: { [monId]: serverTimestamp() },
      nonLus: { [monId]: 0 },
      epingles: { [monId]: false }
    }, { merge: true });
    notifier("Discussion supprimée de ta liste");
    if (convActuelle === c.id) {
      arreterConversation();
      montrer("liste");
    }
  } catch (erreur) {
    console.error(erreur);
    notifier("Erreur : " + erreur.message);
  }
});

// 25) Panneaux : ajouter un ami, profil
function fermerPanneaux() {
  formAmi.classList.add("cache");
  panneauProfil.classList.add("cache");
  messageAmi.textContent = "";
  messageProfil.textContent = "";
}

boutonPlus.addEventListener("click", () => {
  const etaitOuvert = !formAmi.classList.contains("cache");
  fermerPanneaux();
  if (!etaitOuvert) {
    formAmi.classList.remove("cache");
    champAmi.focus();
  }
});

boutonProfil.addEventListener("click", () => {
  const etaitOuvert = !panneauProfil.classList.contains("cache");
  fermerPanneaux();
  if (!etaitOuvert) {
    champProfil.value = pseudo;
    panneauProfil.classList.remove("cache");
  }
});

// 26) Inviter un ami par WhatsApp
function lienInvitation() {
  if (LIEN_APPLICATION) return LIEN_APPLICATION;
  return window.location.href.split("?")[0].split("#")[0];
}

boutonInviter.addEventListener("click", () => {
  const lien = lienInvitation();
  if (!lien) {
    notifier("Ouvre l'application depuis ton lien /full/, ou colle ton lien dans LIEN_APPLICATION.");
    return;
  }

  const texte = "Rejoins-moi sur Jacq appli, l'application de Jacques 👋 " + lien;
  const adresse = "https://wa.me/?text=" + encodeURIComponent(texte);

  const a = document.createElement("a");
  a.href = adresse;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
});

// 27) Ajouter un ami par son e-mail
formAmi.addEventListener("submit", async (e) => {
  e.preventDefault();
  messageAmi.textContent = "";
  const email = champAmi.value.trim().toLowerCase();
  if (!email) return;

  if (email === monEmail) {
    messageAmi.textContent = "C'est ton propre e-mail.";
    return;
  }

  try {
    const resultat = await getDocs(
      query(collection(db, "users"), where("email", "==", email))
    );
    if (resultat.empty) {
      messageAmi.textContent =
        "Aucun compte confirmé avec cet e-mail. Ton ami doit créer son compte et confirmer son e-mail.";
      return;
    }

    const ami = resultat.docs[0];
    const amiId = ami.id;
    const amiPseudo = ami.data().pseudo || "Ami";

    const participants = [monId, amiId].sort();
    const convId = participants.join("_");

    await setDoc(doc(db, "conversations", convId), {
      participants: participants,
      noms: { [monId]: pseudo, [amiId]: amiPseudo }
    }, { merge: true });

    formAmi.reset();
    fermerPanneaux();
    afficherConversation(convId, amiPseudo, amiId);
  } catch (erreur) {
    console.error(erreur);
    messageAmi.textContent = "Erreur : " + erreur.message;
  }
});

// 28) Changer son pseudo (unique, compte + toutes les conversations)
formProfil.addEventListener("submit", async (e) => {
  e.preventDefault();
  messageProfil.textContent = "";
  const nouveau = champProfil.value.trim();
  if (!nouveau) return;
  if (nouveau === pseudo) {
    fermerPanneaux();
    return;
  }

  const probleme = pseudoValide(nouveau);
  if (probleme) {
    messageProfil.textContent = probleme;
    return;
  }

  const nouvelleCle = clePseudo(nouveau);
  const ancienneCle = clePseudo(pseudo);

  try {
    const refNouveau = doc(db, "pseudos", nouvelleCle);
    const s = await getDoc(refNouveau);
    if (s.exists() && s.data().uid !== monId) {
      messageProfil.textContent = "Ce pseudo est déjà pris. Choisis-en un autre.";
      return;
    }
    if (!s.exists()) {
      await setDoc(refNouveau, { uid: monId });
    }

    if (ancienneCle !== nouvelleCle) {
      try {
        await deleteDoc(doc(db, "pseudos", ancienneCle));
      } catch (erreur) {
        console.error(erreur);
      }
    }

    await updateProfile(auth.currentUser, { displayName: nouveau });
    await setDoc(doc(db, "users", monId), { pseudo: nouveau }, { merge: true });

    const resultat = await getDocs(query(
      collection(db, "conversations"),
      where("participants", "array-contains", monId)
    ));
    await Promise.all(resultat.docs.map((d) =>
      setDoc(doc(db, "conversations", d.id),
        { noms: { [monId]: nouveau } }, { merge: true })
    ));

    pseudo = nouveau;
    boutonProfil.textContent = "👤 " + pseudo;
    fermerPanneaux();
    notifier("Pseudo modifié");
  } catch (erreur) {
    console.error(erreur);
    messageProfil.textContent = "Erreur : " + erreur.message;
  }
});

// 29) Marquer la conversation comme lue
function marquerLu() {
  if (!convActuelle || !monId) return;
  setDoc(doc(db, "conversations", convActuelle), {
    lus: { [monId]: serverTimestamp() },
    nonLus: { [monId]: 0 }
  }, { merge: true }).catch((erreur) => console.error(erreur));
}

// 30) Répondre à un message / modifier un message
function afficherContexte(titre, corps) {
  contexteTitre.textContent = titre;
  contexteCorps.textContent = corps;
  barreContexte.classList.remove("cache");
}

function effacerContexte() {
  reponseA = null;
  enModification = null;
  barreContexte.classList.add("cache");
}

contexteFermer.addEventListener("click", () => {
  if (enModification) champTexte.value = "";
  effacerContexte();
});

function commencerReponse(m) {
  enModification = null;
  reponseA = {
    id: m.id,
    uid: m.uid,
    pseudo: m.pseudo || "Ami",
    texte: m.texte.slice(0, 100)
  };
  const auteur = m.uid === monId ? "toi" : (m.pseudo || "Ami");
  afficherContexte("Réponse à " + auteur, reponseA.texte);
  champTexte.focus();
}

function commencerModification(m) {
  reponseA = null;
  enModification = m;
  champTexte.value = m.texte;
  afficherContexte("Modifier le message", m.texte);
  champTexte.focus();
}

function allerAuMessage(id) {
  const element = zoneMessages.querySelector('[data-id="' + id + '"]');
  if (!element) {
    notifier("Message introuvable (il a peut-être été supprimé).");
    return;
  }
  element.scrollIntoView({ behavior: "smooth", block: "center" });
  element.classList.add("surligne");
  setTimeout(() => element.classList.remove("surligne"), 1300);
}

// 31) « En train d'écrire… »
champTexte.addEventListener("input", () => {
  if (!convActuelle || !monId || !champTexte.value.trim()) return;
  if (Date.now() - derniereFrappe < 3000) return;
  derniereFrappe = Date.now();
  setDoc(doc(db, "conversations", convActuelle),
    { ecrit: { [monId]: serverTimestamp() } }, { merge: true })
    .catch((erreur) => console.error(erreur));
});

// 32) Ouvrir une conversation privée
function signatureInfos(info) {
  if (!info) return "";
  const lu = info.lus && autreIdActuel ? millisReel(info.lus[autreIdActuel]) : 0;
  const efface = info.effaces ? millisReel(info.effaces[monId]) : 0;
  return lu + "|" + efface;
}

function afficherConversation(convId, nomAmi, amiId) {
  arreterConversation();
  convActuelle = convId;
  autreIdActuel = amiId;
  forcerBas = true;

  titreConv.textContent = nomAmi;
  statutConv.textContent = "";
  remplirAvatar(avatarConv, nomAmi, amiId);
  zoneMessages.innerHTML = "";
  montrer("conv");

  arreterConv = onSnapshot(doc(db, "conversations", convId), (d) => {
    const avant = signatureInfos(infosConv);
    infosConv = d.exists() ? d.data() : null;
    majBlocage();
    statutConv.textContent = texteStatut();
    if (signatureInfos(infosConv) !== avant) dessinerMessages();
  }, (erreur) => {
    console.error(erreur);
    notifier("Erreur de lecture : " + erreur.message);
  });

  arreterStatut = onSnapshot(doc(db, "users", amiId), (d) => {
    statutAmi = d.exists() ? d.data().vuLe : null;
    statutConv.textContent = texteStatut();
  }, (erreur) => console.error(erreur));

  minuteurStatut = setInterval(() => {
    statutConv.textContent = texteStatut();
  }, 3000);

  const requete = query(
    collection(db, "conversations", convId, "messages"),
    orderBy("date")
  );

  arreterMessages = onSnapshot(requete, (instantane) => {
    messagesActuels = [];
    instantane.forEach((d) => messagesActuels.push({ id: d.id, ...d.data() }));
    dessinerMessages();

    const dernier = messagesActuels[messagesActuels.length - 1];
    if (dernier && dernier.uid !== monId) marquerLu();
  }, (erreur) => {
    console.error(erreur);
    notifier("Erreur de lecture : " + erreur.message);
  });

  marquerLu();
}

function dessinerMessages() {
  const proche =
    zoneMessages.scrollHeight - zoneMessages.scrollTop - zoneMessages.clientHeight < 80;
  const ancienScroll = zoneMessages.scrollTop;
  const descendre = forcerBas || proche;

  zoneMessages.innerHTML = "";

  const luAmi = infosConv && infosConv.lus && autreIdActuel
    ? millisReel(infosConv.lus[autreIdActuel])
    : 0;

  const efface = infosConv && infosConv.effaces
    ? millisReel(infosConv.effaces[monId])
    : 0;

  const visibles = messagesActuels.filter(
    (m) => !m.date || !efface || millisReel(m.date) > efface
  );

  let jourPrecedent = "";

  visibles.forEach((m) => {
    const date = m.date && m.date.toDate ? m.date.toDate() : new Date();
    const jour = date.toDateString();
    if (jour !== jourPrecedent) {
      const sep = document.createElement("div");
      sep.className = "separateur";
      sep.textContent = libelleJour(date);
      zoneMessages.appendChild(sep);
      jourPrecedent = jour;
    }

    const moi = m.uid === monId;
    const bulle = document.createElement("div");
    bulle.className = "message " + (moi ? "moi" : "autre");
    bulle.dataset.id = m.id;
    if (messageOuvert === m.id) bulle.classList.add("ouvert");

    if (m.reponse) {
      const citation = document.createElement("div");
      citation.className = "citation";
      const auteur = document.createElement("strong");
      auteur.textContent = m.reponse.uid === monId ? "Toi" : (m.reponse.pseudo || "Ami");
      const extrait = document.createElement("span");
      extrait.textContent = m.reponse.texte || "";
      citation.appendChild(auteur);
      citation.appendChild(extrait);
      citation.addEventListener("click", (e) => {
        e.stopPropagation();
        allerAuMessage(m.reponse.id);
      });
      bulle.appendChild(citation);
    }

    const contenu = document.createElement("div");
    remplirTexte(contenu, m.texte);
    bulle.appendChild(contenu);

    const bas = document.createElement("div");
    bas.className = "heure";
    if (m.modifie) {
      const mention = document.createElement("span");
      mention.className = "modifie";
      mention.textContent = "modifié";
      bas.appendChild(mention);
    }
    bas.appendChild(document.createTextNode(formaterHeure(m.date)));

    if (moi) {
      const lu = m.date && m.date.toMillis && m.date.toMillis() <= luAmi;
      const coches = document.createElement("span");
      coches.className = "coches" + (lu ? " lu" : "");
      coches.textContent = lu ? "✓✓" : "✓";
      bas.appendChild(coches);
    }
    bulle.appendChild(bas);

    const actions = document.createElement("div");
    actions.className = "actions-msg";

    const repondre = document.createElement("button");
    repondre.type = "button";
    repondre.textContent = "↩ Répondre";
    repondre.addEventListener("click", (e) => {
      e.stopPropagation();
      messageOuvert = null;
      commencerReponse(m);
      dessinerMessages();
    });
    actions.appendChild(repondre);

    const copier = document.createElement("button");
    copier.type = "button";
    copier.textContent = "📋 Copier";
    copier.addEventListener("click", (e) => {
      e.stopPropagation();
      copierTexte(m.texte);
    });
    actions.appendChild(copier);

    if (moi) {
      const modifiable = m.date && Date.now() - millisReel(m.date) < DELAI_MODIFICATION;
      if (modifiable) {
        const modifier = document.createElement("button");
        modifier.type = "button";
        modifier.textContent = "✏️ Modifier";
        modifier.addEventListener("click", (e) => {
          e.stopPropagation();
          messageOuvert = null;
          commencerModification(m);
          dessinerMessages();
        });
        actions.appendChild(modifier);
      }

      const supprimer = document.createElement("button");
      supprimer.type = "button";
      supprimer.className = "danger";
      supprimer.textContent = "🗑 Supprimer";
      supprimer.addEventListener("click", (e) => {
        e.stopPropagation();
        supprimerMessage(m);
      });
      actions.appendChild(supprimer);
    }
    bulle.appendChild(actions);

    bulle.addEventListener("click", () => {
      messageOuvert = messageOuvert === m.id ? null : m.id;
      dessinerMessages();
    });

    zoneMessages.appendChild(bulle);
  });

  if (messagesActuels.length > 0) forcerBas = false;
  zoneMessages.scrollTop = descendre ? zoneMessages.scrollHeight : ancienScroll;
}

// 33) Supprimer un de ses messages
async function supprimerMessage(m) {
  messageOuvert = null;
  const index = messagesActuels.findIndex((x) => x.id === m.id);
  const estDernier = index === messagesActuels.length - 1;
  const precedent = index > 0 ? messagesActuels[index - 1] : null;

  try {
    await deleteDoc(doc(db, "conversations", convActuelle, "messages", m.id));
    if (estDernier) {
      await setDoc(doc(db, "conversations", convActuelle), {
        dernierTexte: precedent ? precedent.texte.slice(0, 80) : "Message supprimé",
        dernierAuteur: precedent ? precedent.uid : monId
      }, { merge: true });
    }
  } catch (erreur) {
    console.error(erreur);
    notifier("Erreur de suppression : " + erreur.message);
  }
}

// 34) Revenir à la liste
boutonRetour.addEventListener("click", () => {
  arreterConversation();
  montrer("liste");
});

// 35) Anti-spam : limiter les envois trop rapides
function autoriserEnvoi() {
  const maintenant = Date.now();
  envois = envois.filter((t) => maintenant - t < FENETRE_ENVOIS);

  if (envois.length > 0 && maintenant - envois[envois.length - 1] < ECART_MIN_ENVOIS) {
    notifier("Doucement ! Attends un instant avant d'envoyer.");
    return false;
  }
  if (envois.length >= ENVOIS_MAX) {
    notifier("Trop de messages d'un coup. Attends quelques secondes.");
    return false;
  }

  envois.push(maintenant);
  return true;
}

// 36) Valider la modification d'un message
async function validerModification(texte) {
  const m = enModification;
  champTexte.value = "";
  effacerContexte();
  if (!m || texte === m.texte) return;

  if (m.date && Date.now() - millisReel(m.date) >= DELAI_MODIFICATION) {
    notifier("Trop tard : on peut modifier un message pendant 15 minutes.");
    return;
  }

  try {
    await setDoc(doc(db, "conversations", convActuelle, "messages", m.id), {
      texte: texte,
      modifie: true,
      modifieLe: serverTimestamp()
    }, { merge: true });

    const index = messagesActuels.findIndex((x) => x.id === m.id);
    if (index === messagesActuels.length - 1) {
      await setDoc(doc(db, "conversations", convActuelle),
        { dernierTexte: texte.slice(0, 80) }, { merge: true });
    }
  } catch (erreur) {
    console.error(erreur);
    notifier("Erreur de modification : " + erreur.message);
  }
}

// 37) Envoyer un message dans la conversation ouverte
formulaire.addEventListener("submit", async (e) => {
  e.preventDefault();
  const texte = champTexte.value.trim();
  if (!texte || !monId || !convActuelle || !autreIdActuel) return;
  if (jaiBloque()) return;

  if (enModification) {
    await validerModification(texte);
    return;
  }

  if (ilMaBloque()) {
    notifier("Impossible d'envoyer ce message pour le moment.");
    return;
  }

  if (!autoriserEnvoi()) return;

  const contexte = reponseA;
  champTexte.value = "";
  effacerContexte();
  panneauEmojis.classList.add("cache");
  derniereFrappe = 0;

  const donnees = {
    texte: texte,
    pseudo: pseudo,
    uid: monId,
    date: serverTimestamp()
  };
  if (contexte) donnees.reponse = contexte;

  try {
    await addDoc(collection(db, "conversations", convActuelle, "messages"), donnees);
    await setDoc(doc(db, "conversations", convActuelle), {
      dernierTexte: texte.slice(0, 80),
      dernierDate: serverTimestamp(),
      dernierAuteur: monId,
      nonLus: { [autreIdActuel]: increment(1) },
      lus: { [monId]: serverTimestamp() },
      ecrit: { [monId]: 0 }
    }, { merge: true });
  } catch (erreur) {
    console.error(erreur);
    if (erreur.code === "permission-denied") {
      notifier("Impossible d'envoyer ce message pour le moment.");
    } else {
      notifier("Erreur d'envoi : " + erreur.message);
    }
  }
});

// 38) Réagir à la connexion ou à la déconnexion
onAuthStateChanged(auth, async (user) => {
  if (inscriptionEnCours) return;

  if (!user) {
    toutArreter();
    arreterBattement();
    fermerPanneaux();
    fermerFeuille();
    monId = null;
    pseudo = "";
    monEmail = "";
    conversations = [];
    listeConv.innerHTML = "";
    zoneMessages.innerHTML = "";
    montrer("auth");
    return;
  }

  if (!user.emailVerified) {
    afficherVerification(user);
    if (!lire("jacq_verif_" + user.uid)) envoyerVerification(user);
    return;
  }

  await entrer(user);
});
