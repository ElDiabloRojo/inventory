import axios from "axios";
import * as M from "materialize-css";
import Vue from "vue";

// tslint:disable-next-line no-unused-expression
new Vue({
  computed: {
    hazItems(): boolean {
      return this.isLoading === false && this.inventory.length > 0;
    },
    noItems(): boolean {
      return this.isLoading === false && this.inventory.length === 0;
    },
  },
  data() {
    return {
      brand: "",
      color: "",
      inventory: [],
      isLoading: true,
      model: "",
      selectedItem: "",
      selectedItemId: 0,
      year: "",
    };
  },
  el: "#app",
  methods: {
    addItem() {
      const item = {
        brand: this.brand,
        color: this.color,
        model: this.model,
        year: this.year,
      };
      axios
        .post("/api/inventory/add", item)
        .then(() => {
          this.$refs.year.focus();
          this.brand = "";
          this.color = "";
          this.model = "";
          this.year = "";
          this.loadItems();
        })
        .catch((err: any) => {
          // tslint:disable-next-line:no-console
          console.log(err);
        });
    },
    confirmDeleteItem(id: string) {
      const item = this.inventory.find((g) => g.id === id);
      this.selectedItem = `${item.year} ${item.brand} ${item.model}`;
      this.selectedItemId = item.id;
      const dc = this.$refs.deleteConfirm;
      const modal = M.Modal.init(dc);
      modal.open();
    },
    deleteItem(id: string) {
      axios
        .delete(`/api/inventory/remove/${id}`)
        .then(this.loadItems)
        .catch((err: any) => {
          // tslint:disable-next-line:no-console
          console.log(err);
        });
    },
    loadItems() {
      axios
        .get("/api/inventory/all")
        .then((res: any) => {
          this.isLoading = false;
          this.inventory = res.data;
        })
        .catch((err: any) => {
          // tslint:disable-next-line:no-console
          console.log(err);
        });
    },
  },
  mounted() {
    return this.loadItems();
  },
});
