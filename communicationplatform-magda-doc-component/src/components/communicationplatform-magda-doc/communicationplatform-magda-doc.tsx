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
  @State() currentPage = 1;
  @State() itemsPerPage = 10;

  private previousFilters: { [key: string]: string } = {};

  async componentDidLoad() {
    console.log('componentDidLoad :' + this.apiurl);
    await this.fetchData();
  }

  async componentDidUpdate() {
    await this.fetchData();
  }

  async fetchData() {
    const filtersChanged = this.filtersChanged();

    if (!filtersChanged) {
      return; // No filter changes, return early
    }

    const url = new URL(this.apiurl);
    const params = new URLSearchParams(url.search);

    for (const column in this.filters) {
      if (column !== 'currentFilter' && column !== 'pageSize' && column !== 'pageNumber') {
        params.set(`${column}Filter`, this.filters[column] || '');
      }
    }

    params.set('pageSize', this.itemsPerPage.toString());
    params.set('pageNumber', this.currentPage.toString());
    url.search = params.toString();

    const response = await fetch(url.toString());
    const jsonData = await response.json();
    this.data = jsonData.map((item) => this.convertTimeColumnsToLocalTime(item));

    this.previousFilters = { ...this.filters }; // Update previous filters
  }

  filtersChanged() {
    for (const column in this.filters) {
      if (this.filters[column] !== this.previousFilters[column]) {
        return true; // Filter value changed
      }
    }

    return false; // No filter changes
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
    this.currentPage = 1; // Reset current page when filters change
  }

  handleItemsPerPageChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.itemsPerPage = parseInt(target.value, 10);
    this.currentPage = 1; // Reset current page when items per page change
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

  getCurrentPageData() {
    const filteredData = this.filterData();
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;

    return filteredData.slice(startIndex, endIndex);
  }

  renderPagination() {
    const filteredData = this.filterData();
    const totalPages = Math.ceil(filteredData.length / this.itemsPerPage);

    return (
      <div class="pagination">
        <button
          disabled={this.currentPage === 1}
          onClick={() => (this.currentPage = this.currentPage - 1)}
        >
          Previous
        </button>
        <span class="page-of">{`Page ${this.currentPage} of ${totalPages}`}</span>
        <button
          disabled={this.currentPage === totalPages}
          onClick={() => (this.currentPage = this.currentPage + 1)}
        >
          Next
        </button>
      </div>
    );
  }

  render() {
    const parsedColumns = JSON.parse(this.columns);
    const currentData = this.getCurrentPageData();

    return (
      <Host>
        <div class="table-container">
          <table class="custom-table">
            <thead>
              <tr>
                {parsedColumns.map((column: string) => (
                  <th>
                    <input
                      type="text"
                      id={`filter-${column}`}
                      placeholder={`Filter ${column}`}
                      value={this.filters[column] || ''}
                      onInput={(event) => this.handleFilterChange(column, event)}
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentData.map((item: any) => (
                <tr>
                  {parsedColumns.map((column: string) => (
                    <td>{this.extractValue(item, column)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div class="items-per-page">
          <label htmlFor="itemsPerPage">Items per page:</label>
          <select id="itemsPerPage" onChange={(event) => this.handleItemsPerPageChange(event)}>
            <option value="10">10</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
        {this.renderPagination()}
      </Host>
    );
  }
}
