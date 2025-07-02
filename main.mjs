"use strict";
import { Post } from "./components/postComponent.js";
const inputAlignRadios = document.querySelectorAll('input[name="align"]');
const inputType = document.querySelector('.input__tool__type');
const downloadBtn = document.querySelector(".input__tool__download");


const postContainer = document.querySelector(".posts__container");

const data = {
    title: "Todos exigen pruebas... pero le rezan a un dios", 
    text: "Todos creen en un dios pero nunca lo questionan como una sugerencia de un amigo", 
    img: "", 
    id: 0, 
    type: "Lunes", 
    align: "center"
}

postContainer.append(Post(data));

const createBtn = document.querySelector(".input__tool__button");
const inputTitle = document.querySelector(".input__tool__title");
const inputText = document.querySelector(".input__tool__text");
const inputImg = document.querySelector(".input__tool__img");

let idCounter = 1;

createBtn.addEventListener("click", () => {
  const file = inputImg.files[0];
  let imgUrl = "";

  if (file) {
    imgUrl = URL.createObjectURL(file);
  }

  // obtener el valor del radio seleccionado
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

downloadBtn.addEventListener("click", async () => {
  const posts = document.querySelectorAll(".post");
  const zip = new JSZip();
  let count = 1;

  for (const post of posts) {
    // Clonar el post para ocultar el botón delete sin modificar el original
    const clone = post.cloneNode(true);
    const deleteBtn = clone.querySelector(".post__delete");
    if (deleteBtn) deleteBtn.remove();

    // Crear contenedor temporal invisible
    const wrapper = document.createElement("div");
    wrapper.style.position = "fixed";
    wrapper.style.top = "-10000px";
    wrapper.style.left = "0";
    wrapper.style.zIndex = "-1";
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    // Capturar imagen con html2canvas
    const canvas = await html2canvas(clone, { backgroundColor: null });
    const dataUrl = canvas.toDataURL("image/png");
    const base64 = dataUrl.split(",")[1];
    zip.file(`post-${count}.png`, base64, { base64: true });

    // Limpiar
    document.body.removeChild(wrapper);
    count++;
  }

  // Generar ZIP y descargar
  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, "posts.zip");
});
