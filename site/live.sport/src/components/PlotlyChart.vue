<template>
    <div ref="plot"></div>
  </template>
  
  <script>
  import Plotly from 'plotly.js-dist';
  
  export default {
    props: {
      data: {
        type: Array,
        required: true,
      },
      layout: {
        type: Object,
        required: true,
      },
    },
    mounted() {
      this.createPlot();
    },
    methods: {
      createPlot() {
        const el = this.$refs.plot;
        Plotly.newPlot(el, this.data, this.layout);
      },
    },
    watch: {
      data() {
        this.createPlot();
      },
      layout() {
        this.createPlot();
      },
    },
    beforeDestroy() {
      const el = this.$refs.plot;
      Plotly.purge(el);
    },
  };
  </script>
  
  <style>
  /* Add any custom styles for the plot container here */
  </style>
  