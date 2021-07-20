import WebViewer from '@pdftron/webviewer';
const dutchJson = require('./translation-nl.json');
const englishJson = require('./translation-en.json');
const frenchJson = require('./translation-fr.json');
const germanJson = require('./translation-de.json');
const italianJson = require('./translation-it.json');
const japaneseJson = require('./translation-ja.json');
const koreanJson = require('./translation-ko.json');
const portugeseBrazilianJson = require('./translation-pt_br.json');
const russianJson = require('./translation-ru.json');
const simplifiedChineseJson = require('./translation-zh_cn.json');
const spanishJson = require('./translation-es.json');
const traditionalChineseJson = require('./translation-zh_tw.json');

import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import {
  Environment,
  EnvironmentType
} from '@microsoft/sp-core-library';

import styles from './PdfTronSampleWebPart.module.scss';
import * as strings from 'PdfTronSampleWebPartStrings';

import {
  SPHttpClient,
  SPHttpClientResponse
} from '@microsoft/sp-http';

export interface IPdftronSampleWebPartWebPartProps {
  description: string;
}

export default class PdftronSampleWebPartWebPart extends BaseClientSideWebPart<IPdftronSampleWebPartWebPartProps> {

  public render(): void {
    this.domElement.style.height = '1000px';

    WebViewer(({
      path: '/_catalogs/masterpage/pdftron/lib',
      uiPath: './ui/index.aspx'
    } as any), this.domElement).then(async i => {
      const { docViewer } = i;

      const options = await this.getSharedFileOptions();

      i.setHeaderItems(header => {
        const renderSlider = () => {
          const select = document.createElement("select");

          for (const val of options) {
            const option = document.createElement("option");
            option.value = val[1];
            option.text = val[0];
            select.appendChild(option);
          }

          select.onchange = _ => {
            i.loadDocument(select.value);
          };

          if (!docViewer.getDocument() && !!options.length) {
            i.loadDocument(options[0][1]);
          }

          return select;
        };

        header.push({
          type: 'customElement',
          render: renderSlider
        });
      });

      (i as any).i18n.on('loaded', () => {
        (i as any).i18n.addResourceBundle('nl', 'translation', dutchJson, true, true);
        (i as any).i18n.addResourceBundle('en', 'translation', englishJson, true, true);
        (i as any).i18n.addResourceBundle('fr', 'translation', frenchJson, true, true);
        (i as any).i18n.addResourceBundle('de', 'translation', germanJson, true, true);
        (i as any).i18n.addResourceBundle('it', 'translation', italianJson, true, true);
        (i as any).i18n.addResourceBundle('ja', 'translation', japaneseJson, true, true);
        (i as any).i18n.addResourceBundle('ko', 'translation', koreanJson, true, true);
        (i as any).i18n.addResourceBundle('pt_br', 'translation', portugeseBrazilianJson, true, true);
        (i as any).i18n.addResourceBundle('ru', 'translation', russianJson, true, true);
        (i as any).i18n.addResourceBundle('zh_cn', 'translation', simplifiedChineseJson, true, true);
        (i as any).i18n.addResourceBundle('es', 'translation', spanishJson, true, true);
        (i as any).i18n.addResourceBundle('zh_tw', 'translation', traditionalChineseJson, true, true);
      });

      // Set your preferred language here.
      i.setLanguage('en');
    });
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }

  private getSharedFileOptions(): Promise<Array<[string, string]>> {
    if (Environment.type === EnvironmentType.Local) {
      // TO-DO: Clean this up
      const localFileOptions: Array<[string, string]> = [
        ['webviewer-demo.pdf', '/Shared Documents/webviewer-demo.pdf'],
        ['form-1040.pdf', '/Shared Documents/form-1040.pdf'],
      ];
      return Promise.resolve(localFileOptions);
    }

    return this.context.spHttpClient.get(this.context.pageContext.web.absoluteUrl + `/_api/web/GetFolderByServerRelativeUrl('/Shared Documents')/Files`, SPHttpClient.configurations.v1)
      .then(async (response: SPHttpClientResponse) => {
        const data = await response.json();
        return data.value.reduce((a, e) => [...a, [e.Name, e.ServerRelativeUrl]], []);
      });
  }
}
