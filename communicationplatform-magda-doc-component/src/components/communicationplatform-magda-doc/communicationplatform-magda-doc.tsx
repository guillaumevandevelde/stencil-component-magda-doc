import { Component, h, Host, Prop, State } from '@stencil/core';

@Component({
  tag: 'communicationplatform-magda-doc',
  styleUrl: 'communicationplatform-magda-doc.css',
  shadow: true,
})
export class CommunicationplatformMagdaDoc {
  @Prop() apiurl!: string;
  @Prop() columns: string;

  @State() data: any[] = [];
  @State() filters: { [key: string]: string } = {};

  async componentDidLoad() {
    console.log('componentDidLoad :' + this.apiurl);
    const response = await fetch(this.apiurl);
    const jsonData = await response.json();
    this.data = jsonData.map(item => this.convertTimeColumnsToLocalTime(item));
  }

  extractValue(obj: any, path: string) {
    const keys = path.split('.');
    let value = obj;

    for (const key of keys) {
      if (typeof value === 'object' && value !== null) {
        value = value[key];
      } else {
        value = undefined;
        break;
      }
    }

    // Convert numeric values to strings
    if (typeof value === 'number') {
      value = value.toString();
    }

    return value || '';
  }

  convertTimeColumnsToLocalTime(item: any) {
    const convertedItem = { ...item };

    for (const key in convertedItem) {
      if (key.toLowerCase().includes('time')) {
        const utcTime = convertedItem[key];
        const localTime = new Date(utcTime);
        const formattedLocalTime = localTime.toLocaleString();
        convertedItem[key] = formattedLocalTime;
      }
    }

    return convertedItem;
  }

  handleFilterChange(column: string, event: Event) {
    const target = event.target as HTMLInputElement;
    this.filters = {
      ...this.filters,
      [column]: target.value,
    };
  }

  filterData() {
    return this.data.filter((item: any) => {
      for (const column in this.filters) {
        const filterValue = this.filters[column].toLowerCase();
        const itemValue = this.extractValue(item, column);

        if (typeof itemValue === 'string' && !itemValue.toLowerCase().includes(filterValue)) {
          return false;
        }

        if (typeof itemValue === 'number' && itemValue.toString() !== filterValue) {
          return false;
        }
      }
      return true;
    });
  }

  render() {
    const parsedColumns = JSON.parse(this.columns);
    const filteredData = this.filterData();

    return (
      <Host>
        <div class="table-container">
          {parsedColumns.map((column: string) => (
            <input
              type="text"
              placeholder={`Filter ${column}`}
              value={this.filters[column] || ''}
              onInput={(event) => this.handleFilterChange(column, event)}
            />
          ))}
        </div>
        <table class="custom-table">
          <thead>
            <tr>
              {parsedColumns.map((column: string) => (
                <th>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item: any) => (
              <tr>
                {parsedColumns.map((column: string) => (
                  <td>{this.extractValue(item, column)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Host>
    );
  }
}
