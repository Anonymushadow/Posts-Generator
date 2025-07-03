// main.mjs (código principal con exportación funcional)
"use strict";
import { Post } from "./components/postComponent.js";

const inputAlignRadios = document.querySelectorAll('input[name="align"]');
const inputType = document.querySelector(".input__tool__type");
const downloadBtn = document.querySelector(".input__tool__download");
const postContainer = document.querySelector(".posts__container");
const createBtn = document.querySelector(".input__tool__button");
const inputTitle = document.querySelector(".input__tool__title");
const inputText = document.querySelector(".input__tool__text");
const inputImg = document.querySelector(".input__tool__img");

let idCounter = 1;

// Primer post fijo
const data = {
  title: "Todos exigen pruebas... pero le rezan a un dios",
  text: "Todos creen en un dios pero nunca lo questionan como una sugerencia de un amigo",
  img: "",
  id: 0,
  type: "Lunes",
  align: "center"
};
postContainer.append(Post(data));

// Crear nuevos posts
createBtn.addEventListener("click", () => {
  const file = inputImg.files[0];
  let imgUrl = "";
  if (file) imgUrl = URL.createObjectURL(file);

  const selectedAlign = [...inputAlignRadios].find(r => r.checked)?.value || "center";

  const newPostData = {
    title: inputTitle.value,
    text: inputText.value,
    img: imgUrl,
    id: idCounter++,
    type: inputType.value,
    align: selectedAlign
  };

  const newPost = Post(newPostData);
  postContainer.append(newPost);
});

// Descargar posts como .zip de .pngs

function createTextSVG(text, fontSize, color, fontFamily, width = 1080) {
  const escapedText = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;");

  return `
    <svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${fontSize + 20}'>
      <text x='50%' y='${fontSize}' text-anchor='middle' fill='${color}' font-size='${fontSize}' font-family='${fontFamily}' dominant-baseline='middle'>${escapedText}</text>
    </svg>`;
}

function svgToImage(svgString) {
  const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);
  const img = new Image();
  img.src = url;
  img.style.width = "100%";
  return new Promise(resolve => {
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
  });
}

downloadBtn.addEventListener("click", async () => {
  // Esperar que todas las fuentes estén cargadas antes de capturar
  await document.fonts.ready;

  const posts = document.querySelectorAll(".post");

  const zip = new JSZip();
  let count = 1;

  for (const post of posts) {
    const clone = post.cloneNode(true);

    // Eliminar el botón de borrar
    const deleteBtn = clone.querySelector(".post__delete");
    if (deleteBtn) deleteBtn.remove();

    // Reemplazar textos por SVG
    const texts = clone.querySelectorAll(".post__title, .post__text");
    for (const el of texts) {
      const text = el.textContent.trim();
      const fontSize = parseInt(window.getComputedStyle(el).fontSize) || 60;
      const fontFamily = window.getComputedStyle(el).fontFamily;
      const color = "white"; // o el que quieras
      const svg = createTextSVG(text, fontSize, color, fontFamily);
      const img = await svgToImage(svg);
      el.replaceWith(img);
    }

    // Capturar imagen
    const wrapper = document.createElement("div");
    wrapper.style.position = "fixed";
    wrapper.style.top = "-10000px";
    wrapper.style.left = "0";
    wrapper.style.zIndex = "-1";
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    const canvas = await html2canvas(clone, { backgroundColor: null });
    const dataUrl = canvas.toDataURL("image/png");
    const base64 = dataUrl.split(",")[1];
    zip.file(`post-${count}.png`, base64, { base64: true });

    document.body.removeChild(wrapper);
    count++;
  }

  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, "posts.zip");
});
