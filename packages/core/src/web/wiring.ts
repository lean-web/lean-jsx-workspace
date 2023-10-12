export function fillPlaceHolder(placeHolderId: string) {
    // const template = document.getElementById(
    //     placeHolderId
    // ) as HTMLTemplateElement;
    //   const container = document.querySelector(
    //     `[data-placeholder="${placeHolderId}"]`
    //   );

    //   if (!template || !container) {
    //     return;
    //   }
    //   const clone = document.importNode(template.content, true);
    //   const maybeNestedTemplate = clone.querySelector("[data-placeholder]");
    //   if (maybeNestedTemplate) {
    //     while (container.firstChild) {
    //       maybeNestedTemplate.appendChild(container.firstChild);
    //     }
    //   }

    //   container.innerHTML = "";
    //   container.removeAttribute(`[data-${placeHolderId}]`);
    //   if (container.parentElement) {
    //     // if we can, replace the placeholder with the actual element
    //     container.parentElement.replaceChild(clone, container);
    //   } else {
    //     container.appendChild(clone);
    //   }

    const template = document.getElementById(
        placeHolderId
    ) as HTMLTemplateElement;
    const container = document.querySelector(
        `[data-placeholder="${placeHolderId}"]`
    );

    if (!template || !container) {
        console.debug("Could not find template or container", {
            template,
            container,
        });
        return;
    }
    const clone = document.importNode(template.content, true);

    const maybeNestedTemplate = clone.querySelector("[data-placeholder]");
    if (maybeNestedTemplate) {
        while (container.firstChild) {
            maybeNestedTemplate.appendChild(container.firstChild);
        }
    }

    container.innerHTML = "";
    container.removeAttribute(`[data-${placeHolderId}]`);
    if (container.parentElement) {
        // if we can, replace the placeholder with the actual element
        container.parentElement.replaceChild(clone, container);
    } else {
        container.appendChild(clone);
    }
    // clean-up the template
    // template.remove();
}
