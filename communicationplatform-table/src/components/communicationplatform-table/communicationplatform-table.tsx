import { Component, h, Host, Prop, State, Watch } from '@stencil/core';

@Component({
  tag: 'communicationplatform-table',
  styleUrl: 'communicationplatform-table.css',
  shadow: true,
})
export class CommunicationplatformTable {
  @Prop() apiurl!: string;
  @Prop() columns: string;
  @Prop() filters : string;  
  
  @Prop() pagesizequeryparameter: string ; 

  @State() data: any[] = [];
  @State() pageSize: number = 10;  

  @State() currentPage = 1;
  @State() isTyping = false;


  private timeout: any;
  private parsedFilters : string[] = [];
  private filtersApplied: any = {};

  constructor() {
    this.parsedFilters = JSON.parse(this.filters);
  }


  async componentDidLoad() {
        
    await this.fetchData();
  }

  @Watch('pageSize')
  handlePageSizeChange() {
    this.currentPage = 1; // Reset current page when pageSize changes
    this.fetchData();
  }

  @Watch('currentPage')
  handleCurrentPageChange() {
    this.fetchData();
  }

  async fetchData() {
    const url = new URL(this.apiurl);
    const params = new URLSearchParams(url.search);

    for (const column in this.filtersApplied) {
      if (column !== 'currentFilter' && column !== this.pagesizequeryparameter && column !== 'pageNumber') {
        params.set(`${column}`, this.filtersApplied[column] || '');
      }
    }

    params.set(this.pagesizequeryparameter, this.pageSize.toString());

    url.search = params.toString();

    const response = await fetch(url.toString());
    const jsonData = await response.json();    

    // Update the data based on the received JSON
    if (Array.isArray(jsonData)) {
      this.data = jsonData.map((item: any) => this.formatTime(item));
    } else if (typeof jsonData === 'object' && jsonData !== null) {
      const firstArrayProp = Object.values(jsonData).find(Array.isArray);
      if (firstArrayProp) {
        this.data = firstArrayProp.map((item: any) => this.formatTime(item));
      } else {
        console.error('Invalid JSON data:', jsonData);
      }
    } else {
      console.error('Invalid JSON data:', jsonData);
    } 
  }

  extractValue(obj: any, path: string) {
    const keys = path.split('.');
    let value: any = obj;

    for (const key of keys) {
      if (typeof value === 'object' && value !== null && key in value) {
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

  formatTime(item: any) {
    const convertedItem = { ...item };

    for (const key in convertedItem) {
      if (key.toLowerCase().includes('time')) {
        const utcTime = convertedItem[key];
        const localTime = new Date(utcTime);
        convertedItem[key] = localTime.toLocaleString();
      }
    }

    return convertedItem;
  }

  handleItemsPerPageChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.pageSize = parseInt(target.value);
    this.currentPage = 1; // Reset current page when items per page change
    this.fetchData();
  }

  handleFilterChange(column: string, event: Event) {
    const target = event.target as HTMLInputElement;
    this.filtersApplied = {    
      [column]: target.value,
    };

    clearTimeout(this.timeout); // Clear the previous timeout

    this.isTyping = true;

    this.timeout = setTimeout(() => {
      this.isTyping = false;
      this.fetchData(); // Trigger search when typing stops
    }, 500); // Adjust the debounce delay as needed
  }

  renderPagination() {
    const totalPages = Math.ceil(this.data.length / this.pageSize);

    return (
      <div class="pagination">
        <button disabled={this.currentPage === 1} onClick={() => (this.currentPage = this.currentPage - 1)}>
          Previous
        </button>
        <span class="page-of">{`Page ${this.currentPage} of ${totalPages}`}</span>
        <button disabled={this.currentPage === totalPages} onClick={() => (this.currentPage = this.currentPage + 1)}>
          Next
        </button>
      </div>
    );
  }

  render() {
    const parsedColumns = JSON.parse(this.columns);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    const currentData = this.data.slice(startIndex, endIndex);

    return (
      <Host>
        <div class="table-container">
          <table class="custom-table">
            <thead>   
              <tr>
                {parsedColumns.map((column: string) => <th>{column}</th>)}
              </tr>           
              <tr>
                {parsedColumns.map((column: string) =>  {
    
                  if (this.parsedFilters.includes(column) ) {
                  return(
                  <th>
                    <input
                      type="text"
                      id={`filter-${column}`}
                      placeholder={`Filter ${column}`}
                      value={this.filters[column] || ''}
                      onInput={event => this.handleFilterChange(column, event)}
                    />
                  </th>)
                } else {
                  return <th></th>;
                }}

                )
              }
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
          <select id="itemsPerPage" onChange={event => this.handleItemsPerPageChange(event)}>
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
