/*
  Cole abaixo a URL do Google Apps Script
  publicado como Aplicativo da Web.
*/

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwdJOK0nC23c3YsOE-LO1RTQ4FF7xCS8iaxWCmLeyAW6u0Iwli3W0oiUQEG0eJpAmj10w/exec";


const intro =
  document.getElementById("intro");

const openInvite =
  document.getElementById("openInvite");

const form =
  document.getElementById("inviteForm");

const qty =
  document.getElementById("cortesias");

const companionsWrap =
  document.getElementById("companionsWrap");

const formMessage =
  document.getElementById("formMessage");

const submitBtn =
  document.getElementById("submitBtn");


/*
  Bloqueia a rolagem enquanto
  a tela inicial estiver aberta.
*/

document.body.style.overflow = "hidden";


/*
  Abre o convite.
*/

openInvite.addEventListener("click", () => {

  intro.classList.add("is-hidden");

  intro.setAttribute(
    "aria-hidden",
    "true"
  );

  document.body.style.overflow = "";

});


/*
  Anima os elementos conforme
  aparecem na tela.
*/

const observer =
  new IntersectionObserver(
    (entries) => {

      entries.forEach((entry) => {

        if (entry.isIntersecting) {

          entry.target.classList.add(
            "is-visible"
          );

        }

      });

    },
    {
      threshold: 0.12
    }
  );


document
  .querySelectorAll(".reveal")
  .forEach((element) => {

    observer.observe(element);

  });


/*
  Gera os campos dos acompanhantes
  conforme a quantidade de cortesias.
*/

qty.addEventListener("change", () => {

  companionsWrap.innerHTML = "";

  const total =
    Number(qty.value || 0);

  /*
    A quantidade escolhida já inclui
    o influenciador.
  */

  const companions =
    Math.max(0, total - 1);


  if (!companions) {
    return;
  }


  const title =
    document.createElement("div");

  title.innerHTML = `
    <strong>Nome dos acompanhantes</strong>

    <small>
      Informe exatamente como consta no documento.
    </small>
  `;

  companionsWrap.appendChild(title);


  for (
    let i = 1;
    i <= companions;
    i += 1
  ) {

    const field =
      document.createElement("div");

    field.className = "field";

    field.innerHTML = `
      <label for="acompanhante${i}">
        Acompanhante ${i}
      </label>

      <input
        id="acompanhante${i}"
        name="acompanhante${i}"
        type="text"
        required
      />
    `;

    companionsWrap.appendChild(field);

  }

});


/*
  Converte a data de:
  2026-07-13

  Para:
  13/07/2026
*/

function formatDateBR(value) {

  if (!value) {
    return "—";
  }

  const [
    year,
    month,
    day
  ] = value.split("-");

  return `${day}/${month}/${year}`;

}


/*
  Garante que o Instagram
  seja salvo com @.
*/

function normalizeInstagram(value) {

  const clean =
    value
      .trim()
      .replace(/\s+/g, "");

  return clean.startsWith("@")
    ? clean
    : `@${clean}`;

}


/*
  Valida o período permitido.
*/

function validateDate(value) {

  return (
    value >= "2026-07-13" &&
    value <= "2026-08-02"
  );

}


/*
  Envio do formulário.
*/

form.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();

    formMessage.textContent = "";

    formMessage.className =
      "form-message full";


    /*
      Verifica campos obrigatórios.
    */

    if (!form.checkValidity()) {

      form.reportValidity();

      return;

    }


    const data =
      new FormData(form);


    const chosenDate =
      String(
        data.get("dataVisita")
      );


    /*
      Confirma novamente a data,
      mesmo que alguém tente alterar
      o HTML pelo navegador.
    */

    if (!validateDate(chosenDate)) {

      formMessage.textContent =
        "Escolha uma data entre 13/07/2026 e 02/08/2026.";

      formMessage.classList.add(
        "error"
      );

      return;

    }


    /*
      Organiza os dados.
    */

    data.set(
      "instagram",
      normalizeInstagram(
        String(data.get("instagram"))
      )
    );


    data.set(
      "dataVisitaFormatada",
      formatDateBR(chosenDate)
    );


    data.set(
      "enviadoEm",
      new Date().toLocaleString(
        "pt-BR"
      )
    );


    /*
      Junta todos os acompanhantes
      em um único campo da planilha.
    */

    const companions = [];

    for (
      let i = 1;
      i <= 4;
      i += 1
    ) {

      const name =
        data.get(
          `acompanhante${i}`
        );

      if (name) {

        companions.push(
          String(name).trim()
        );

      }

    }


    data.set(
      "acompanhantes",
      companions.join(" | ")
    );


    /*
      Verifica se a URL do Apps Script
      já foi configurada.
    */

    if (
      !GOOGLE_SCRIPT_URL.startsWith(
        "https://script.google.com/"
      )
    ) {

      formMessage.textContent =
        "Integração ainda não configurada. Cole a URL do Apps Script no arquivo script.js.";

      formMessage.classList.add(
        "error"
      );

      return;

    }


    submitBtn.disabled = true;

    submitBtn.textContent =
      "Confirmando...";


    try {

      /*
        O modo no-cors permite o envio
        do GitHub Pages para o Apps Script.
      */

      await fetch(
        GOOGLE_SCRIPT_URL,
        {
          method: "POST",
          mode: "no-cors",

          body:
            new URLSearchParams(
              [...data.entries()]
            )
        }
      );


      /*
        Preenche o passe digital.
      */

      document
        .getElementById("passName")
        .textContent =
          data.get("nome");


      document
        .getElementById("passDate")
        .textContent =
          data.get(
            "dataVisitaFormatada"
          );


      document
        .getElementById("passQty")
        .textContent =
          `${data.get("cortesias")} pessoa(s)`;


      /*
        Oculta o formulário.
      */

      form
        .closest(".section")
        .style.display = "none";


      /*
        Mostra o passe.
      */

      const success =
        document.getElementById(
          "successScreen"
        );

      success.hidden = false;


      success.scrollIntoView({
        behavior: "smooth"
      });


    } catch (error) {

      console.error(error);

      formMessage.textContent =
        "Não foi possível confirmar agora. Verifique sua conexão e tente novamente.";

      formMessage.classList.add(
        "error"
      );


    } finally {

      submitBtn.disabled = false;

      submitBtn.textContent =
        "Confirmar minha presença";

    }

  }
);
