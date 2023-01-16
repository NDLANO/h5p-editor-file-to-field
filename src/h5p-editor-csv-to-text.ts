import type { H5PFieldText, IH5PWidget } from "h5p-types";
import { H5P, H5PEditor, H5PWidget, registerWidget } from "h5p-utils";
import { parseCSV } from "./utils/csv.utils";
import "./index.css";

const html = String.raw;

const widgetName = "csv-to-text";

const wordHintSeparator = ":";
const languageSeparator = "|";

class CSVToTextWidget extends H5PWidget<H5PFieldText> implements IH5PWidget {
  public $item: JQuery<HTMLElement> | undefined;
  public $input: JQuery<HTMLTextAreaElement> | undefined;
  public $errors: JQuery<HTMLElement> | undefined;

  private textarea: HTMLTextAreaElement | undefined;

  appendTo($container: JQuery<HTMLDivElement>) {
    const { field } = this;

    const isFileField = field.type === "text";
    if (!isFileField) {
      console.warn(
        `The field \`${field.name}\` has the widget \`${widgetName}\` set, but is of type \`${field.type}\`, not \`text\``,
      );
    }

    const fileInputElement = CSVToTextWidget.createFileInput(event =>
      this.insertIntoField(event),
    );

    this.textarea = CSVToTextWidget.createTextarea(
      this.params ?? "",
      ({ target }) => {
        const { value } = target as HTMLTextAreaElement;
        this.setValue(this.field, value);
      },
    );

    const label = H5PEditor.createLabel(field);
    this.wrapper.innerHTML += label;
    this.wrapper.classList.add("field");
    this.wrapper.classList.add("field-name-textField");

    if (this.field.important) {
      const importantDescription = H5PEditor.createImportantDescription(
        this.field.important,
      );

      this.wrapper.innerHTML += importantDescription;
    }

    const description = field.description
      ? html`<div
          class="h5peditor-field-description"
          id="field-description-${this.textarea.id}-description"
        >
          ${field.description}
        </div>`
      : null;

    if (description) {
      this.wrapper.innerHTML += description;
    }

    this.wrapper.appendChild(fileInputElement);
    this.wrapper.appendChild(this.textarea);

    $container.get(0)?.append(this.wrapper);

    this.$item = H5PEditor.$(this.wrapper);
    this.$input = H5PEditor.$(this.textarea);
    this.$errors = this.$item.children(".h5p-errors");

    H5PEditor.bindImportantDescriptionEvents(this, field.name, this.parent);
  }

  validate() {
    return true;
  }

  remove() {}

  private static createFileInput(
    eventListener: (event: Event) => void,
  ): HTMLDivElement {
    const inputId = H5P.createUUID();
    
    const fileInputWrapper = document.createElement("div");
    fileInputWrapper.classList.add("file");
    fileInputWrapper.classList.add("csvtotext-file");

    const fileInputLabelText = document.createElement("div");
    fileInputLabelText.classList.add("h5peditor-field-file-upload-text");
    fileInputLabelText.innerHTML += "Import CSV-file";

    const fileInputElement = document.createElement("input");
    fileInputElement.id = inputId;
    fileInputElement.type = "file";
    fileInputElement.accept = "text/csv";
    fileInputElement.multiple = true;
    fileInputElement.addEventListener("change", eventListener);
    fileInputElement.classList.add("csvtotext-input");

    const fileInputLabel = document.createElement("label");
    fileInputLabel.classList.add("add");
    fileInputLabel.appendChild(fileInputLabelText);
    fileInputLabel.appendChild(fileInputElement);

    const fileInputValue = document.createElement("div");
    fileInputValue.id = "csv-to-text-value";
    fileInputValue.innerHTML += fileInputElement.value;
    fileInputValue.classList.add("csvtotext-value");

    fileInputWrapper.appendChild(fileInputLabel);
    fileInputWrapper.appendChild(fileInputValue);

    return fileInputWrapper;
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

  private async insertIntoField(event: Event): Promise<void> {
    const files = Array.from((event.target as HTMLInputElement).files ?? []);

    if (!this.textarea) {
      return;
    }

    const newValue = (
      this.textarea.value +
      "\n" +
      (
        await Promise.all(
          files.map(async file =>
            parseCSV(
              await file.text(),
              wordHintSeparator,
              languageSeparator,
            ).join("\n"),
          ),
        )
      ).join("\n")
    ).trim();

    this.textarea.value = newValue;
    this.setValue(this.field, newValue);

    const inputValueDiv = document.getElementById("csv-to-text-value") as HTMLDivElement;
    inputValueDiv.innerHTML = files[0]?.name ?? "";
  }
}

if (!H5PEditor.widgets) {
  H5PEditor.widgets = {};
}

registerWidget(CSVToTextWidget.name, widgetName, CSVToTextWidget);
