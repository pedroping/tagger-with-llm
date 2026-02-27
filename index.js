import { pipeline, env } from "@xenova/transformers";

env.cacheDir = "models";
env.allowRemoteModels = false;

let candidateLabels = [
  "Accessibility",
  "Angular",
  "Animations",
  "Architecture",
  "Cache",
  "Change Detection",
  "CI/CD",
  "Css",
  "Decorators",
  "Dependecy Injection",
  "Entrevista",
  "File Streams",
  "Forms",
  "HTML",
  "JavaScript",
  "LINT",
  "Micro Front end",
  "Modules",
  "Node",
  "OOP",
  "Perfomance",
  "React",
  "RUST",
  "RXJS",
  "Security",
  "SEO",
  "Signals",
  "Under The Hood",
  "Vite",
  "WEB Assembly",
  "WEB Components",
];

async function tagArticle() {
  console.log("Loading model... (this will download on the first run)");

  const classifier = await pipeline(
    "zero-shot-classification",
    "Xenova/bart-large-mnli",
  );

  const title = `
    Demystifying the Magic: How Modern Browsers Transform Your Code Into Interactive Experiences
    What Every Full-Stack JavaScript Engineer Should Know About Browser Architecture in 2026
    Aryan Garg
    Aryan Garg
    
    Follow
    Bootcamp
    Bootcamp
    
    androidstudio
    ~10 min read
    ·
  `;
  const candidateLabels = [
    "Accessibility",
    "Angular",
    "Animations",
    "ARCH",
    "Cache",
    "CD",
    "CI/CD",
    "Css",
    "Decorators",
    "DI",
    "Entrevista",
    "File-Streams",
    "Forms",
    "HTML",
    "JS",
    "LINT",
    "MF",
    "Modules",
    "Node",
    "OOP",
    "Perfomance",
    "React",
    "RUST",
    "RXJS",
    "Security",
    "SEO",
    "Signals",
    "Under-The-Hood",
    "Vite",
    "WEB-A",
    "WEB-C",
  ];

  const options = {
    multi_label: true,
    hypothesis_template: "The topic of this article is {}.",
  };

  console.log(`Analyzing title: "${title}"`);

  const result = await classifier(title, candidateLabels, options);

  candidateLabels.forEach((label, i) => {
    console.log(`Tag ${label}: ${result.scores[i]}`);
  });

  console.log("Full Output:", result);
}

function chunkText(text, maxWords = 8) {
  const words = text.split(/\s+/);
  const chunks = [];
  for (let i = 0; i < words.length; i += maxWords) {
    chunks.push(words.slice(i, i + maxWords).join(" "));
  }
  return chunks;
}

async function tagArticleWithChunking() {
  console.log("Loading model...");
  const classifier = await pipeline(
    "zero-shot-classification",
    "Xenova/bart-large-mnli",
    { device: "gpu" },
  );

  const title = `How Angular Dependency Injection works under the hood
Thomas Laforge
Thomas Laforge

Follow
11 min read
·
Nov 16, 2023
480


8





Press enter or click to view image in full size

Dependency Injection (DI) is one of the most beloved and powerful features of Angular, and it happens to be my personal favorite as well. Understanding and mastering it can elevate your Angular skills and grant you superpowers.

In this article, I will explain what Dependency Injection is and delve into how it operates within Angular to provide a profound understanding.

What is a Dependency Injection
Let’s start by examining an example that doesn’t use Dependency Injection:

@Component({
   //...
})
export class AppComponent {
  service = new RootService();
}
In this example, we directly instantiate the RootService using the new keyword, resulting in a hardcoded dependency and a tight coupling between AppComponent and RootService. While this approach does work, it lacks flexibility, testability, and scalability in the long run, making it less maintainable.

Now, let’s consider the same example using Dependency Injection, where you’ll recognise a well-known Angular code snippet:

@Component({
   //...
})
export class AppComponent {
  service = inject(RootService);
// constructor(private service: RootService) {}
}
Notes: you can use either the constructor or the inject function, as both methods have the same underlying implementation.

As we can see, AppComponent is no longer directly responsible for instantiating RootService. Instead, it delegates this task to an external source, which is responsible for either returning an existing instance or creating a new instance of the requested service.

We can simplify the code for this external source, which might look like this:


export const inject = (searchClass: Class) => {
  const dependance = find(searchClass)
  if(dependance) {
    return dependance;
  } else {
    return new searchClass();
  }
}
In this example, AppComponent doesn’t need to have knowledge about RootService. This reduces the coupling between classes and their dependencies, making the code more maintainable, testable, and reusable.

In Angular, this external source is referred to as an Injector. And its implementation can be compared to a dictionary of records. The structure of a record looks like this:

record:{
 //...
 [index]:{
   key: class RootService,
   value: {
    factory: ƒ RootService_Factory(t),
    value: {}
   }
 //...
}
The Injector stores information about all injectable classes, which includes anything with a decorator such as @Injectable, @Component, @Pipe, and @Directive.

Returning to the previous example, when AppComponent requests RootService, the Injector iterates over its records to locate the requested token. Once found, the Injector returns the value if it's not undefined, indicating that the service has already been instantiated. Otherwise, the Injector creates a new instance using the factory function.

As you can observe, the record is simply an object, and the value can be easily overridden. For example, if we write the following code:

@Component({
   //...
   providers: [{ provide: RootService, useClass: OtherService }]
})
export class AppComponent {
  service = inject(RootService);
}
The Injector will override the value property within the RootService record:

record:{
 //...
 [index]:{
   key: class RootService,
   value: {
    factory: ƒ OtherService_Factory(t),
    value: {}
   }
 //...
}
This means that when AppComponent requests RootService, the Injector will provide a new instance of OtherService.

Note: This example simplifies how Angular’s Dependency Injection works, but it illustrates the underlying DI principle.

The next section delves into more advanced aspects, revealing the inner workings of Angular’s DI system.

Angular Dependency Injection
Angular has two categories of Injectors:

EnvironmentInjector: This category includes all global injectable classes provided through the router, modules, or using the providedIn: 'root' keyword.
NodeInjector: This category contains all local injectable classes found in each component or template.
It’s important to note that each small piece of a view containing injectable classes (referred to as LView) has its own NodeInjector, and within this NodeInjector, we can locate all services provided within the component provider array or any directives used within that LView.

LView !== Component

Creation of EnvironmentInjector Tree
When we bootstrap the application, the bootstrapApplication function is called in our main.ts file. This function takes two parameters:

The root Component
A list of providers
bootstrapApplication(AppComponent, {
  providers: [GlobalService],
})
Under the hood, this function will create three EnvironmentInjectors chained together:

NullInjector: This is the end of the road. Its sole purpose is to throw an error: “NullInjectorError: No provider for …!!!”
PlatformInjector: It contains a list of tokens that inform Angular about the platform the application is running on, such as browser, server, web worker, etc.
Example: this is where the InjectionToken DOCUMENT is created. For instance, if you are on a browser, this token will return window.document, whereas on a server, Angular will build and provide a DOM using Domino. It's crucial to always work with the DOCUMENT token by injecting it instead of using window.document. This ensures compatibility if you ever need to render your application from a server.

import { DOCUMENT } from '@angular/common';

@Component()
export class FooComponent {
  document = inject(DOCUMENT) // ✅
  document = window.document // ❌
}
RootInjector: This is the most well-known of the three. It’s where all our global services (injectables set as root) are stored.
Notes: If we refer back to the earlier example, the GlobalService instance will be located within this injector.

All three of these injectors are chained together.

Creation of NodeInjector Tree
In this section, we will explore examples that you likely encounter in your daily projects. The first part aims to provide a better understanding of how the NodeInjector tree is created. (The NodeInjectorTree is similar to the ComponentTree but not strictly identical.)

We will then see how Angular determines which dependencies to retrieve or create.

Note: In this article, we will not discuss modules since most applications are expected to transition to standalone. Furthermore, all new Angular applications will be set to standalone by default starting from v17.

Tree Creation

Let’s examine what a NodeInjectorTree looks like. We’ll begin with a very simple example: a Parent with one Child.

@Component({
  template: '<child />',
  imports: [ChildComponent],
})
export class ParentComponent {}

@Component({})
export class ChildComponent {}
This results in the following tree:


Since ParentComponent and ChildComponent are annotated with @Component, it means they are injectable. Thus, each component is stored within its own NodeInjector as follows. It's important to note that ChildComponent can inject ParentComponent, but it cannot inject itself, as this would create a circular dependency.


Now, let’s add another child to the parent:

@Component({
  template: '
    <child />
    <child />
   ',
  imports: [ChildComponent],
})
export class ParentComponent {}

@Component({})
export class ChildComponent {}
The structure of both trees remains similar.

Press enter or click to view image in full size

However, let’s see what happens when we encapsulate one child into a div with a directive on it.

@Directive({
  selector: '[foo]',
  standalone: true,
})
export class FooDirective {}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ChildComponent, FooDirective],
  template: '
    <div foo>
      <child />
    </div>
    <child />
  ',
})
export class ParentComponent {}

Now the InjectorTree begins to diverge from the ComponentTree. A new Injector has appeared. Since FooDirective is a type of @Directive, it means it's injectable, and the first ChildComponent can inject it.

Write on Medium
From this example, we can see that a NodeInjector is not associated with a Component but with an LView (Logical View).

With these three examples, you have all you need to understand how the InjectorTree is built.

(Note: Routing and ActivatedRoute will be explained in a follow-up article.)

Now, let’s explore different ways of providing an injectable service and how Angular locates the instance you are injecting.

Component provider
Within the component decorator, you have a property called providers that allows you to provide an Injectable class, as illustrated below:

@Component({
  template: '...',
  providers: [MyComponentService],
})
export class MyComponent {}
The service provided inside the decorator will be stored within the records of the NodeInjector of MyComponent. Please note that providing your service does not instantiate it. A service is instantiated only when it is injected.

Let’s now examine which instance is returned with two concrete examples:

Example 1:

@Component({
  template: '
    <child />
    <child />
   ',
  imports: [ChildComponent],
})
export class ParentComponent {}

@Component({
  providers: [MyService]
})
export class ChildComponent {
  myService = inject(MyService);
}
This results in the following NodeInjectorTree:

Press enter or click to view image in full size

As we can see, MyService is present inside both ChildInjectors. When Angular creates the first ChildComponent class, it will request MyService from the DI system. The DI system will start by searching inside the record of ChildInjector, which looks like this:

record:{
 //...
 [index]:{
   key: class MyService,
   value: {
    factory: ƒ MyService_Factory(t),
    value: undefined
   }
 //...
}
Angular will iterate over all dictionary entries of the Injector to check if the key MyService is present. Since MyService is present inside this NodeInjector, it will then check if it has already been instantiated, which is not the case since the value is undefined. In this case, a new instance of MyService will be created and returned.

If the key wasn’t present inside the record, the DI system will move to the next Injector until finding it or reaching the NullInjector, which will throw an error and terminate the application.

The same process will repeat for the second instance of ChildComponent. Angular will start searching inside its own NodeInjector, find the key inside the record, and since MyService has not been instantiated, a new instance will be created.

Example 2:

Now, let’s provide MyService inside ParentComponent instead of inside ChildComponent.

@Component({
  providers: [MyService]
  template: '
    <child />
    <child />
   ',
  imports: [ChildComponent],
})
export class ParentComponent {}

@Component({})
export class ChildComponent {
  myService = inject(MyService);
}
Now, MyService is located inside the record of ParentInjector.

Press enter or click to view image in full size

This time, when Angular creates the first ChildComponent, it won't find the key of MyService inside the record of ChildInjector. Angular will then move up to the next Injector, which is ParentInjector. The record of ParentInjector looks like this:

record:{
 //...
 [index]:{
   key: class MyService,
   value: {
    factory: ƒ MyService_Factory(t),
    value: undefined
   }
 //...
}
Since MyService has not been instantiated yet, a new instance will be created and returned.

However, things are different when the second ChildComponent is created. Angular will traverse the NodeInjectorTree until reaching ParentInjector. But this time, the ParentInjector looks like this:

record:{
 //...
 [index]:{
   key: class MyService,
   value: {
    factory: ƒ MyService_Factory(t),
    value: MyService {
      prop1: 'xxx'
      // ...
    }
   }
 //...
}
The value of MyService is no longer undefined. The DI System will return this instance to the second ChildComponent. This means that both ChildComponents are sharing the same instance of MyService, unlike in the previous example.

Note: If ParentComponent was injecting MyService, the same instance would be shared among all three components.

ProvidedIn: ‘root’
The providedIn: 'root' is one of the most commonly used injectable designs within Angular applications, but not everyone fully understands the implications of these two words. This chapter aims to provide a clear explanation.

Let’s create a very basic application with a parent and a child:

@Component({
  template: '<child />',
  imports: [ChildComponent],
})
export class ParentComponent {}

@Component({})
export class ChildComponent {
  service = inject(RootService);
}

@Injectable({ providedIn: 'root' })
export class RootService {}
When we examine the NodeInjectorTree, we find that RootService is not present in any of the records. This is because Angular does not include it in any Injector until a component actually injects it.


Note: In the context of lazy-loaded routes, RootService may get tree-shaken and bundled outside the main bundle. This topic is beyond the scope of this article, but you can read more about it below.

Mastering Injectable Services: A Comprehensive Guide
learn how to use @Injectable decorator the correct way.
itnext.io

When Angular creates ChildComponent, it searches for RootService starting from the ChildInjector and moving up the tree, eventually reaching the EnvironmentInjectorTree and more precisely, the RootInjector.

Note: The exact implementation is more complex, but for the sake of simplicity, we’ll provide a high-level explanation here.

When the DI system reaches the RootInjector, it searches for the RootService key, similar to any other NodeInjector. However, it doesn't find it there either. Unlike NodeInjectors, before moving to the next EnvironmentInjector, it compares the scope of the Injector with the scope of the service being injected.

The code below is a portion of the get function of the RootInjector: (If you want to see the full function, you can go here)

let record: Record<T>|undefined|null = this.records.get(token);
if (record === undefined) {
  // No record, but maybe the token is scoped to this injector. Look for an injectable
  // def with a scope matching this injector.
  const def = couldBeInjectableType(token) && getInjectableDef(token);
  if (def && this.injectableDefInScope(def)) {
    // Found an injectable def and it's scoped to this injector. Pretend as if it was here
    // all along.
    record = makeRecord(injectableDefOrInjectorDefFactory(token), NOT_YET);
  } else {
    record = null;
  }
  this.records.set(token, record);
}
First, it attempts to retrieve the record of the searched token. If there is no record, it checks if the service has an InjectableDef (the providedIn property). If the service has one and if the scope matches the scope of the current EnvironmentInjector (root in our case), a new record is created and added to the Injector, then a new instance is returned.

The next time a component requests RootService, the record will be present, and the same instance will be returned.

Note: While less common, if you want to provide your service inside the PlatformInjector, you can set your Injectable to providedIn: 'platform'.

Warning: In practice, setting the providedIn: 'root' property for your Injectable service signifies that your service will be a singleton. However, if you provide your service within the providers property of one of your components, this service will be added to the record of the NodeInjector of that component. Let's see an example to better understand this:

@Component({})
export class ChildComponent {
  service = inject(RootService);
}

@Component({
  providers: [RootService]
})
export class FooComponent {
  service = inject(RootService);
}

@Component({
  template: '
    <child />
    <foo />
  ',
  imports: [ChildComponent, FooComponent],
})
export class ParentComponent {}

// injectable service
@Injectable({ providedIn: 'root' })
export class RootService {}
Here, we have a providedIn: 'root' RootService, which is injected inside both FooComponent and ChildComponent. However, we provide RootService inside the NodeInjector of FooComponent. This gives us the following graph:

Press enter or click to view image in full size

ChildComponent will have an instance of the service located inside the RootInjector, whereas FooComponent will have the one from its own Injector. This can be misleading because by observing the service, one might assume that both components share the same global instance, which is not the case in this example.

In summary, providedIn: 'root' is only information for Angular to create a record inside RootInjector and only if the service reaches that point while searching for it inside the InjectorTree.

I really hope that the Dependency Injection System of Angular will no longer hold any secrets for you. You should now be able to harness its power to create exceptional applications and understand whether an instance of a service will be shared or unique.

You can expect me to write follow-up articles on the following subjects:

Dependency Injection inside Routed Components
Injection Flags: Host, Self, SkipSelf, and Optional
All the options for overriding within the DI: useClass, useValue, useFactory, useExisting`;

  const chunks = chunkText(title.toLocaleLowerCase().trim(), 250);
  console.log(`\nOriginal text split into ${chunks.length} chunks.`);

  const scoreTotals = {};
  candidateLabels = candidateLabels.map((l) => l.toLocaleLowerCase());
  candidateLabels.forEach((label) => (scoreTotals[label] = 0));

  const options = {
    multi_label: false,
    hypothesis_template: "The topic of this article is {}.",
  };

  console.log("\nAnalyzing chunks...");
  for (let i = 0; i < chunks.length; i++) {
    const result = await classifier(chunks[i], candidateLabels, options);

    console.log(`- Chunk ${i + 1}`, result.scores);

    for (let j = 0; j < result.labels.length; j++) {
      const label = result.labels[j];
      const score = result.scores[j];
      scoreTotals[label] += score;
    }
  }

  const finalResults = candidateLabels.map((label) => {
    return {
      label: label,
      score: scoreTotals[label] / chunks.length,
    };
  });

  finalResults.sort((a, b) => b.score - a.score);

  console.log("\n--- Final Averaged Results ---");
  finalResults.forEach((res) => {
    console.log(`- ${res.label}: ${(res.score * 100).toFixed(2)}%`);
  });
}

tagArticleWithChunking();
