import React, { useEffect } from "react";
import { useForm, FormProvider, FieldError, Resolver, FieldValue, FieldValues } from "react-hook-form";
import * as yup from "yup";
import { xml2js } from "xml-js";
import { isArray, isEmpty, merge } from "lodash";
import { ServerPaginationGrid } from "./ServerPaginationGrid";

// Define the types
export interface VehicleAttributes {
  type: string;
  desc: string;
}

interface Vehicle {
  _attributes: VehicleAttributes;
  _internalId: string
}

interface Vehicles {
  Vehicle: Vehicle[];
}

interface RootItem {
  Vehicles: Vehicles[];
}

export interface Root {
  Root: RootItem[];
}

// Helper function for nested errors
const setNestedError = (path: string, errorMessage: string): FieldError => {
  const pathParts = path.split(".");
  return pathParts.reduceRight<Record<string, any>>(
    (value, key) => {
      const arrayMatch = key.match(/(\w+)\[(\d+)\]/);
      if (arrayMatch) {
        const [, arrayKey, index] = arrayMatch;
        return {
          [arrayKey]: Array(Number(index) + 1)
            .fill(undefined)
            .map((_, i) => (i === Number(index) ? value : undefined)),
        };
      }
      return { [key]: value };
    },
    {
      message: errorMessage,
      type: "validation",
      ref: {},
    }
  ) as FieldError;
};

// Yup schema with proper typing
const schema = yup.object().shape({
  Root: yup.array().of(
    yup.object().shape({
      Vehicles: yup.array().of(
        yup.object().shape({
          Vehicle: yup.array().of(
            yup.object().shape({
              _attributes: yup.object().shape({
                type: yup.string().required("Type is required"),
                desc: yup.string().required("Description is required"),
              }),
            })
          ),
        })
      ),
    })
  ),
});

const customYupResolver = <T extends FieldValues>(schema: yup.AnySchema): Resolver<T> => {
  return async (values: T, _context: any, options: { names?: string[] }) => {
    const { names } = options;

    try {
      if (isArray(names) && !isEmpty(names)) {
        await schema.validateAt(names[0], values, { abortEarly: false });
      } else {
        await schema.validate(values, { abortEarly: false });
      }

      return {
        values,
        errors: {},
      };
    } catch (error: any) {
      let errors: Record<string, any> = {};

      if (error.inner) {
        error.inner.forEach((err: any) => {
          const nestedError = setNestedError(err.path, err.message);
          errors = merge(errors, nestedError);
        });
      }

      return {
        values: {},
        errors,
      };
    }
  };
}

const xmlString =
  '<Root><Vehicles><Vehicle type="car" desc="Toyota"/><Vehicle type="bus" desc="Man"/><Vehicle type="Truck" desc="Ivenco"/><Vehicle type="car" desc="Mazda"/></Vehicles></Root>';

// Main component
const App = () => {
  const jsonXML = xml2js(xmlString, { compact: true, alwaysArray: true }) as Root; // Cast to the Root type

  const methods = useForm<Root>({
    resolver: customYupResolver<Root>(schema),
    mode: "onChange",
  });

  useEffect(() => {
    console.log('jsonXML: ', jsonXML)
    methods.reset(jsonXML);
  }, []);

  return (
    <div className="App">
      <FormProvider {...methods}>
        <ServerPaginationGrid datapath="Root[0].Vehicles[0].Vehicle" />
      </FormProvider>
    </div>
  );
};

export default App;
