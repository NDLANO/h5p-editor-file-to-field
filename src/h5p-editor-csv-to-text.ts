import type { H5PFieldText, IH5PWidget } from "h5p-types";
import { H5P, H5PEditor, H5PWidget, registerWidget } from "h5p-utils";
import { parseCSV } from "./utils/csv.utils";

const html = String.raw;

const widgetName = "csv-to-text";

const wordHintSeparator = ":";
const languageSeparator = "|";

class CSVToTextWidget extends H5PWidget<H5PFieldText> implements IH5PWidget {
  private textarea: HTMLTextAreaElement | undefined;

  appendTo($container: JQuery<HTMLDivElement>) {
    const { field } = this;

    const isFileField = field.type === "text";
    if (!isFileField) {
      console.warn(
        `The field \`${field.name}\` has the widget \`${widgetName}\` set, but is of type \`${field.type}\`, not \`text\``,
      );
    }

    const fileInputElement = CSVToTextWidget.createFileInput(
      this.insertIntoField,
    );
    this.insertFieldElement(fileInputElement);

    this.textarea = CSVToTextWidget.createTextarea(
      this.params ?? "",
      ({ target }) => {
        const { value } = target as HTMLTextAreaElement;

        this.setValue(this.field, value);
      },
    );

    this.insertFieldElement(this.textarea);

    $container.append(H5P.jQuery(this.wrapper));
  }

  validate() {
    return true;
  }

  remove() {}

  private static createFileInput(
    eventListener: (event: Event) => void,
  ): HTMLInputElement {
    const inputId = H5P.createUUID();
    const fileInputElement = document.createElement("input");
    fileInputElement.id = inputId;
    fileInputElement.type = "file";
    fileInputElement.accept = "text/csv";
    fileInputElement.multiple = true;
    fileInputElement.addEventListener("change", eventListener);

    return fileInputElement;
  }

  private static createTextarea(
    value: string,
    eventListener: (event: Event) => void,
  ): HTMLTextAreaElement {
    const inputId = H5P.createUUID();

    const textarea = document.createElement("textarea");
    textarea.id = inputId;
    textarea.value = value;
    textarea.addEventListener("change", eventListener);

    return textarea;
  }

  private insertFieldElement(element: HTMLElement): void {
    const inputId = element.id;
    const containerId = `container_${inputId}`;

    const fileInputMarkup = H5PEditor.createFieldMarkup(
      this.field,
      html`<div id="${containerId}"></div>`,
      inputId,
    );

    this.wrapper.innerHTML = fileInputMarkup;

    const inputContainer = this.wrapper.querySelector(`#${containerId}`);
    inputContainer?.appendChild(element);
  }

  private async insertIntoField(event: Event): Promise<void> {
    const files = Array.from((event.target as HTMLInputElement).files ?? []);

    if (!this.textarea) {
      return;
    }

    const newValue =
      this.textarea.value +
      (
        await Promise.allSettled(
          files.map(async file =>
            parseCSV(await file.text(), wordHintSeparator, languageSeparator),
          ),
        )
      ).join("\n");

    this.textarea.value = newValue;
    this.setValue(this.field, newValue);
  }
}

if (!H5PEditor.widgets) {
  H5PEditor.widgets = {};
}

registerWidget(CSVToTextWidget.name, widgetName, CSVToTextWidget);
