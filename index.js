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

  const title = `
    Encryption/Decryption Stream on Demand — NodeJS approach
    The right way to encrypt your huge data on demand, with no memory leaks and no hardware impacts!
    For you that is new here, we are beginning a new series of articles, following the NodeJS approach.

In my last article, I wrote about NodeJS streams and their impact on machine hardware. I created many and many cases to show how we could handle the same scenario — which was write one million logs in a file — with:

Callbacks
Asynchronous code and fs/promises module
Synchronous code and fs module
Streams with memory leaks
Streams without memory leaks
The article is available and I recommend that you read it before we start here:

Writable Streams in NodeJs— Hardware Impact Analysis
The most efficient way to transfer data between one point in the system and another, using little random access memory…
victorfjansen.com

A friendly advice:
In the article that I mentioned here, I wrote about buffers, binaries, hexadecimal numbers, how NodeJs handle these objects in Streams, and also about memory allocation in NodeJS.

Please, to not be lost here, read the article.

A little introduction about Readable, Duplex, and Transform streams
If you are familiar with Streams, you should know this representation:

Press enter or click to view image in full size

Some obvious annotations:

Streams have internal Buffer objects to handle data (or chunks).
Streams are EventEmitters (subject that we already talked about in our previous article), and communicate by observing events as “data”. You can observe this behavior by seeing the last arrow getting out from the buffer representation.
Streams do not have necessarily 16834 bytes. It can have as many bytes as we want, it just simply changes the “highWaterMark” property.
So, unlike the Writable Streams, now we are reading from some source by separating the source into chunks. That's the principle.

And how we can implement a readable stream to read one million numbers, for example? See:


Please note:

We’re using writable streams to copy another file with one million rows — each row has 1 number — and I built this file with the code of the last article — it just took 200ms to build.
The read stream uses the event “data” to get each chunk — one for time — and write it at our write stream.
The read stream can be paused and resumed just by using simple commands. The idea is that when buffers get filled, the write stream stops and just resumes at the “drain” event — which is the event charged with emptying the buffer.
This process took just 14ms to complete:

Press enter or click to view image in full size

Ok, now that we know how to manage the events at writable stream and readable stream, we can see the Duplex and Transform streams.

Duplex and Transform streams, how do they differ from each other?
Essentially, Duplex Streams are one Readable Stream with another Writable Stream.

They have the same behavior as we saw previously, and a Duplex Stream can be used instead of creating two different streams.

Press enter or click to view image in full size

And about the Transform Stream?

Let’s suppose that we want to transform our data while using streams. What we can do? We can use a Duplex stream passing data to each internal buffer. In theory, we can just connect the data leaving from the Write Stream to the entrance of the Readable Stream, and transform the data while the chunks are flowing between them.

By doing this, we have our Transform Stream. It’s just it!

Press enter or click to view image in full size

Great, now that we know the theory, we can start coding something.

I thought about writing code in each way — writing at first one writable, and then readable, and the duplex/transform — but for educational purposes I will just exemplify with duplex before writing our encrypt/decrypt with transform.

Duplex Stream from scratch
Our first step will be to declare our Stream structure. As a helper to our implementation, we will extend our main class with DuplexStream from the “streams” package.

So we got:


Now, we should get some properties to initialize our class. For our implementation, we will define the readFilename, the writeFilename, writableHighWaterMark, and the readableHighWaterMark.

As the name suggests, the “waterMark” properties will be used to define the Buffer’s size of our internal Buffers — as we saw in the last article.

Our constructor:


Please note:

The readableHighWaterMark and the writableHighWaterMark are used at super function. As we are extending from the Duplex class, we can set these properties natively.
For the file names, we’re creating new properties to store them.
But it’s not only this. How we’re doing our implementation, we need to control the internal chunks and their size.

So, if the buffer reads a chunk, and then reads another chunk, our “chunkSize” property will be of size two. And the current chunk will be the second one.

Remember that we’re dealing with streams, so we can’t store all buffers and need to count every chunk that we read.

Our final constructor will be something like this:


Ok, to the next step, we need to declare another constructor. But how? Javascript Classes only allow one constructor.

For streams, we have a method called “_constructor()”. This is our second constructor. It’s called right after the original constructor function.

Download the Medium app
In this function, we should mount our files and open each source to read and write.


Please note:

At this function, we have a callback parameter which is a function.
This callback function is responsible for proceeding with the stream flow or notifying the stream that has some error in our implementation — you can call callback(err) or just callback().
We’re getting a parameter terminated in “Fd” which means “file descriptor”. File descriptors are the identification of files in our environment. Node uses file descriptors to refer to files in the context of the “fs” module.
So basically, we’re opening the files that we have declared, and, if some error happens, the stream will be notified about it.

Our next step will be to implement the write function. As we saw, we have a write buffer inside of the stream and we should use it to manage the flowing chunks.


Please note:

We’re only using the chunk and callback parameters. The encoding parameter refers to the encoding used in the buffer ( as utf8, ascii, etc..)
First, we push our current chunk to the chunk property and add the current chunk size to the chunk size property.
We verify if the current chunk size is higher than our writableHighWaterMark. If yes, this means that our buffer are filled and need to be emptied. So we write to the file, concatenating the existing buffers, verifying if there are no errors, resetting chunk properties, and calling the callback function to proceed with stream flow.
If not, we just proceed to push the chunk property and call the callback function, waiting for the chunk size to be higher than the writableHighWaterMark.
Great! Now we already did our write function and need to write our read function, so let’s see how it could be:


Note:

We’re receiving size as a parameter from the read function, and creating a new Buffer to allocate the correct size.
We’re reading from the reading descriptor (the file that we declared to read) and passing a lot of parameters. These parameters are the file descriptor, the buffer that stores the data fetched from the file, the offset position (initial position from where to start writing), the length of total data, the position of where to start reading, and the callback with error and bytes read quantity.
We’re pushing the data for the Readable Buffer.
Not the last, but not the least, the _final function. The _final function is responsible for flushing the last chunk and writing the last time in the Buffer. It’s a simple implementation, but it’s important for the stream lifecycle.


Note:

We receive a callback function as every function receives.
We’re resetting the chunks and cleaning our Stream.
Our callback is called at the end, indicating that our implementation has been finished.
And now, the least (I promise lol), is the _destroy function. The _destroy function is responsible for the destruction of the stram. It will be executed when:

The user (or your code) explicitly calls stream.destroy().
The stream encounters an unrecoverable error internally.
The stream is being forcibly closed for some other reason (e.g., process shutdown).
You can handle it in many ways, but for us, I will just ignore it and proceed with the end of the cycle.


Great! And now that we have finished our custom stream implementation? We can use it to write and read data! See:


Now, if we create a file called “read.txt” and put some string content into it, we will see at the terminal:

Press enter or click to view image in full size

In your created file called “write.txt”, you will see:

Press enter or click to view image in full size

It’s not well formatted, but it’s ok!

Now, we know how the process of a duplex stream works, and how to create a custom stream (consider this process the same as creating a readable or writable stream), and we know how to use it in both ways — writing and reading.

Finally, Encryption and Decryption Stream!
To be honest, maybe the Encryption and Decryption stream could be a disappointment to you. It’s easy to implement them haha.

All processes are made by the Transform Stream class, and as we saw, we would extend the Transform class in our Encrypt/Decrypt stream.

But see, we have some advantages here:

It’s easy to implement
We are encrypting it on demand. So our hardware impacts are minimal and you can encrypt a huge content!
Let’s see how we can do it. For the Encrypt Stream:


Note:

We’re using only the _transform function. This function is responsible for transforming the data and passing it from a writable stream to a readable stream.
For our “Encryption” — never use this type of encryption. It’s only for educational purposes. If you implement this encryption, easily a hacker can discover and get the decrypted data — we’re using the principle of every time adding one to the Buffer position.

So if we have a buffer: Buffer<0x01, 0x02, 0x03>, our “encryption” will return a Buffer with: Buffer<0x02, 0x03, 0x04>. Consequently, when we’re using the utf8 decoder, they will interpret as another character.

Usage notes:


And now, the Decrypt Stream implementation:


Note:

It’s the pretty same thing as the Encrypt Stream, but instead of sum, we’re decreasing in each Buffer position.
And the usage:


Conclusion
If you’ve read this far — and also read the article I mentioned in the first section — I’m sure you understand the implementation.
As I always say, my goal here is never to get to the point but rather to explore the possibilities and how to do things from scratch.

Given our understanding gained from these articles, it is certainly now possible for you to discover more and more about worry-free streams.

Understand pipelines, async generators in streams, and much more.

I strongly recommend Erick Wendel’s content about streams.

In the future, I will talk about networks and how we can create implementations such as TCP and UDP in our applications from scratch, using streams and without external libraries.
  `;

  const chunks = chunkText(title.toLocaleLowerCase(), 650);
  console.log(`\nOriginal text split into ${chunks.length} chunks.`);

  const scoreTotals = {};
  candidateLabels = candidateLabels.map((l) => l.toLocaleLowerCase());
  candidateLabels.forEach((label) => (scoreTotals[label] = 0));

  const options = {
    multi_label: false,
    hypothesis_template: "The topic of this article is [].",
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
