<template>
  <div class="container">
    <PGTables />
    <h4>Таблица</h4>
    <table v-if="fields.length > 0">
      <thead>
        <tr>
          <td>name</td>
          <td>type</td>
          <td>scale</td>
          <td>not null</td>
          <td>default</td>
        </tr>
      </thead>
      <tbody>
        <TRfieldVue v-for="f in fields" :field="f" :key="f" />
        <tr>
          <td>
            <a class="btn" @click="addTable">Добавить таблицу</a>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="row">
      <InputFieldVue class="col s2" :label="'Имя поля'"  v-model="field.fname" />
      <SelectTypesVue
        class="col s4"
        @change="test"
        v-if="pg_types_fields.length > 0"
        :list="pg_types_fields"
        v-model="field.ftype"/>
      <InputFieldVue class="col s2" :label="'Размер поля'"  v-model="field.scale" />
      <MSwitch :label="'Not Null'" class="col s1" v-model="field.fnull" />
      <InputFieldVue class="col s2" :label="'По умолчанию'"  v-model="field.default" />
      <a class="btn" @click="addField">Добавить поле</a>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import InputFieldVue from '../components/InputField.vue';
import SelectTypesVue from '../components/SelectTypes.vue';
import TRfieldVue from '../components/TRfield.vue';
import MSwitch from '../components/MSwitch.vue';
import PGTables from '../components/PGTables.vue';

export default {
  components: {
    SelectTypesVue,
    InputFieldVue,
    TRfieldVue,
    MSwitch,
    PGTables,
  },
  data() {
    return {
      fields: [],
      field: {
        fname: '',
        ftype: 0,
        fnull: '',
        scale: '',
        default: '',
      },
    };
  },
  computed: {
    ...mapState('postgree', ['pg_types_fields', 'tables']),
  },
  methods: {
    ...mapActions(['fetchData']),
    addField() {
      this.fields.push({ ...this.field });
      console.log(this.field);
    },
    addTable() {
      this.fetchData({
        url: '/create/',
        data: { fields: this.fields },
      })
        .then((e) => console.log(e));
    },
  },
  mounted() {
    this.fetchData({
      stateName: 'postgree/pg_types_fields',
    });
  },
};
</script>
