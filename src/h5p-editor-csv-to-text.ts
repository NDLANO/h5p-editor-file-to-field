import type { H5PFieldText, IH5PWidget } from 'h5p-types';
import { H5P, H5PEditor, H5PWidget, registerWidget } from 'h5p-utils';
import { t } from './h5p/h5p.utils';
import './index.css';
import { InvalidRow } from './types/InvalidRow';
import { parseCSV } from './utils/csv.utils';
import { getInvalidRows } from './utils/word.utils';

const html = String.raw;

const widgetName = 'csv-to-text';

const wordHintSeparator = ':';
const languageSeparator = '|';

class CSVToTextWidget extends H5PWidget<H5PFieldText> implements IH5PWidget {
  public $item: JQuery<HTMLElement> | undefined;
  public $input: JQuery<HTMLTextAreaElement> | undefined;
  public $errors: JQuery<HTMLElement> | undefined;

  private hasErrors = false;
  private textarea: HTMLTextAreaElement | undefined;

  appendTo($container: JQuery<HTMLDivElement>) {
    const { field } = this;

    const isFileField = field.type === 'text';
    if (!isFileField) {
      console.warn(
        `The field \`${field.name}\` has the widget \`${widgetName}\` set, but is of type \`${field.type}\`, not \`text\``,
      );
    }

    const fileInputElementValue = CSVToTextWidget.createFileInputValue();

    const fileInputElement = CSVToTextWidget.createFileInput((event) =>
      this.insertIntoField(event, fileInputElementValue),
    );

    this.textarea = CSVToTextWidget.createTextarea(
      this.params ?? '',
      ({ target }) => {
        const { value } = target as HTMLTextAreaElement;
        this.setWordCount();

        const rows = value.split('\n');
        const invalidRows = getInvalidRows(rows);
        const hasErrors = invalidRows.length > 0;
        if (!hasErrors) {
          this.hideTextareaErrors();
        }
      },
      ({ target }) => {
        this.hideTextareaErrors();

        const { value } = target as HTMLTextAreaElement;
        this.setValue(this.field, value);

        const rows = value.split('\n');

        const invalidRows = getInvalidRows(rows);
        const hasErrors = invalidRows.length > 0;
        if (hasErrors) {
          this.showTextareaErrors(invalidRows);
          this.hasErrors = true;
        }
        else {
          this.hasErrors = false;
        }
      },
    );

    const label = H5PEditor.createLabel(field);
    this.wrapper.innerHTML += label;
    this.wrapper.classList.add('field', `field-name-${field.name}`);

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
    this.wrapper.appendChild(fileInputElementValue);
    this.wrapper.appendChild(this.textarea);

    const wordCount = this.getNumberOfRows();
    this.wrapper.appendChild(CSVToTextWidget.createWordCount(wordCount));

    $container.get(0)?.append(this.wrapper);

    this.$item = H5PEditor.$(this.wrapper);
    this.$input = H5PEditor.$(this.textarea);
    this.$errors = this.$item.children('.h5p-errors');

    if (this.params) {
      const rows = this.params.split('\n');
      const invalidRows = getInvalidRows(rows);
      const hasErrors = invalidRows.length > 0;

      if (hasErrors) {
        this.showTextareaErrors(invalidRows);
        this.hasErrors = true;
      }
    }

    H5PEditor.bindImportantDescriptionEvents(this, field.name, this.parent);
  }

  validate() {
    return this.hasErrors;
  }

  remove() {}

  private static createFileInputValue(): HTMLDivElement {
    const fileInputValue = document.createElement('div');
    fileInputValue.classList.add('csvtotext-value');
    return fileInputValue;
  }

  private static createFileInput(
    eventListener: (event: Event) => void,
  ): HTMLDivElement {
    const inputId = H5P.createUUID();

    const fileInputWrapper = document.createElement('div');
    fileInputWrapper.classList.add('file');
    fileInputWrapper.classList.add('csvtotext-file');

    const fileInputLabelText = document.createElement('div');
    fileInputLabelText.classList.add('h5peditor-field-file-upload-text');
    fileInputLabelText.innerHTML += t('importCSVFileButtonLabel');

    const fileInputElement = document.createElement('input');
    fileInputElement.id = inputId;
    fileInputElement.type = 'file';
    fileInputElement.accept = 'text/csv';
    fileInputElement.multiple = true;
    fileInputElement.addEventListener('change', eventListener);
    fileInputElement.classList.add('csvtotext-input');

    const fileInputLabel = document.createElement('label');
    fileInputLabel.classList.add('add');
    fileInputLabel.appendChild(fileInputLabelText);
    fileInputLabel.appendChild(fileInputElement);

    fileInputWrapper.appendChild(fileInputLabel);

    return fileInputWrapper;
  }

  private static createTextarea(
    value: string,
    inputEventListener: (event: Event) => void,
    changeEventListener: (event: Event) => void,
  ): HTMLTextAreaElement {
    const inputId = H5P.createUUID();

    const textarea = document.createElement('textarea');
    textarea.id = inputId;
    textarea.value = value;

    textarea.addEventListener('input', inputEventListener);
    textarea.addEventListener('change', changeEventListener);

    return textarea;
  }

  private static getWordCountLabel(count: number): string {
    const wordCountTranslationKey =
      count === 1 ? 'wordCount_singular' : 'wordCount_plural';

    return t(wordCountTranslationKey, {
      ':count': count.toString(),
    });
  }

  private static createWordCount(count: number): HTMLDivElement {
    const wordCount = document.createElement('div');
    wordCount.classList.add('csvtotext-wordcount');
    wordCount.innerHTML = CSVToTextWidget.getWordCountLabel(count);

    return wordCount;
  }

  private setWordCount() {
    if (!this.textarea) {
      return;
    }

    let wordCount = this.wrapper.querySelector('.csvtotext-wordcount');
    if (!wordCount) {
      return;
    }

    const count = this.getNumberOfRows();
    wordCount.innerHTML = CSVToTextWidget.getWordCountLabel(count);
  }

  private getNumberOfRows(): number {
    if (!this.textarea) {
      return 0;
    }

    return this.textarea.value
      .split('\n')
      .filter((row) => row.trim().length > 0).length;
  }

  private hideTextareaErrors() {
    this.wrapper.querySelector('.csvtotext-textarea-errors-wrapper')?.remove();
  }

  private showTextareaErrors(invalidRows: Array<InvalidRow>) {
    if (!this.textarea || !this.$errors) {
      return;
    }

    const wrapper = document.createElement('div');
    wrapper.classList.add('csvtotext-textarea-errors-wrapper');

    const errorTitle = document.createTextNode(t('textareaErrorsTitle'));
    wrapper.appendChild(errorTitle);

    const errorList = document.createElement('ul');

    invalidRows.forEach(({ row, index }) => {
      const error = document.createElement('li');
      error.innerHTML = `${index}: ${row}`;

      errorList.appendChild(error);
    });

    wrapper.appendChild(errorList);
    this.wrapper.appendChild(wrapper);
  }

  private async insertIntoField(
    event: Event,
    fileInputElementValue: HTMLDivElement,
  ): Promise<void> {
    const files = Array.from((event.target as HTMLInputElement).files ?? []);

    if (!this.textarea) {
      return;
    }

    const newValue = (
      this.textarea.value +
      '\n' +
      (
        await Promise.all(
          files.map(async (file) =>
            parseCSV(
              await file.text(),
              wordHintSeparator,
              languageSeparator,
            ).join('\n'),
          ),
        )
      ).join('\n')
    ).trim();

    this.textarea.value = newValue;
    this.setValue(this.field, newValue);

    fileInputElementValue.innerHTML = files.map(({ name }) => name).join(', ');
  }
}

if (!H5PEditor.widgets) {
  H5PEditor.widgets = {};
}

registerWidget(CSVToTextWidget.name, widgetName, CSVToTextWidget);
