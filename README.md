# h5p-editor-csv-to-text

Upload a CSV file and insert its parsed contents into an H5P field.

## How to use

This widget can be added to any field of type `text`.
It will render a button that lets the user upload a CSV file and a textarea that the file contents are inserted into.

### Format

The CSV file is parsed and outputted on the format that's consumed by <https://github.com/NDLANO/h5p-vocabulary-drill>.

Input: `ocean/sea;o___n;sjø;s_ø`
Output: `'ocean/sea:o___n|sjø:s_ø'`

The CSV parser automatically detects the CSV delimiter and currently supports using either comma (`,`) or semi colon (`;`).

### Usage

The widget's name is `csv-to-text`.

`semantics.json`:

```json
{
  "label": "Words",
  "name": "words",
  "type": "text",
  "widget": "csv-to-text",
  "description": "Add words by uploading a CSV-file or write them in the text field.",
  "important": {
    "description": "<ul><li>Source and target words are separated with a comma (,).</li><li>Alternative answers are separated with a forward slash (/).</li><li>You may add a textual tip, using a colon (:) in front of the tip.</li></ul>",
    "example": "water/sea:w___r,vann/hav:v__n"
  }
}
```

It is not part of the H5P core, therefore it must be added as an editor dependency.

`library.json`:

```json
{
  "editorDependencies": [
    {
      "machineName": "H5PEditor.CSVToText",
      "majorVersion": 1,
      "minorVersion": 0
    },
  ]
}
```

#### Result

![Screenshot of the widget when specified as in the example code above](https://user-images.githubusercontent.com/9085189/216600680-424c1934-2792-4a59-9216-fded55a20d1b.png)

